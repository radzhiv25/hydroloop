/**
 * Offline-first outbound queue for hydration_logs inserts.
 * Rows are keyed by client_event_id; server upserts use ignoreDuplicates to avoid overwrites.
 */

const QUEUE_KEY = "pending_remote_logs";

function readQueue(store) {
  const raw = store.get(QUEUE_KEY);
  if (!Array.isArray(raw)) return [];
  return raw;
}

/** @typedef {{ client_event_id: string, happened_at: string, amount_ml: number, drink_type: string }} PendingRemoteRow */

/** @param {import('conf').default} store */
export function enqueueRemoteLog(store, row) {
  const q = readQueue(store);
  if (q.some((r) => r.client_event_id === row.client_event_id)) return;
  q.push(row);
  store.set(QUEUE_KEY, q);
}

/** @param {import('conf').default} store */
export function getPendingRemoteLogs(store) {
  return readQueue(store);
}

/** @param {import('conf').default} store */
export function dequeueRemoteLogs(store, idsToRemoveSet) {
  const q = readQueue(store).filter((r) => !idsToRemoveSet.has(r.client_event_id));
  store.set(QUEUE_KEY, q);
}

/**
 * Build deterministic ids for older local entries that never got client_event_id.
 * Stable across runs so duplicates never enqueue twice locally.
 */
export function legacyCliClientEventId(log, indexHint) {
  const date = log.date ?? "unknown-date";
  const ts = log.timestamp ?? "unknown-ts";
  const amt = log.amountMl ?? 0;
  const idx =
    typeof log.clientSequence === "number" ? log.clientSequence : indexHint;
  return `legacy_cli:${date}:${ts}:${amt}:${idx}`;
}
