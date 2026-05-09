/**
 * Flush pending remote log rows via Supabase (idempotent upsert).
 */
import { getAuthedRemoteClient } from "./supabase-remote.js";
import { dequeueRemoteLogs, getPendingRemoteLogs } from "./pending-remote-logs.js";

/** @typedef {import('conf').default} ConfStore */

/**
 * @param {ConfStore} store
 * @param {{ verbose?: boolean }} [opts]
 * @returns {Promise<{ pushed: number, skippedReason?: string }>}
 */
export async function pushPendingRemoteLogs(store, opts = {}) {
  const verbose = opts.verbose ?? false;

  const pending = getPendingRemoteLogs(store);
  if (pending.length === 0) {
    return { pushed: 0, skippedReason: "empty_queue" };
  }

  const auth = await getAuthedRemoteClient(store);
  if (!auth.ok) {
    return { pushed: 0, skippedReason: auth.reason };
  }

  const { supabase, userId } = auth;

  let remaining = [...pending];

  while (remaining.length > 0) {
    const batch = remaining.slice(0, 100);
    remaining = remaining.slice(100);

    const rows = batch.map((r) => ({
      user_id: userId,
      happened_at: r.happened_at,
      amount_ml: r.amount_ml,
      drink_type: r.drink_type || "water",
      source: "cli",
      client_event_id: r.client_event_id,
    }));

    const { error } = await supabase.from("hydration_logs").upsert(rows, {
      onConflict: "user_id,client_event_id",
      ignoreDuplicates: true,
    });

    if (error) {
      throw new Error(error.message || error.code || String(error));
    }
  }

  const succeeded = new Set(pending.map((r) => r.client_event_id));
  dequeueRemoteLogs(store, succeeded);

  if (verbose) {
    // eslint-disable-next-line no-console
    console.log(`Uploaded ${pending.length} log row(s) to cloud`);
  }

  return { pushed: pending.length };
}
