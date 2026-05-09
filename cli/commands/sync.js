import chalk from "chalk";
import { getStore } from "../utils/storage.js";
import {
  enqueueRemoteLog,
  getPendingRemoteLogs,
  legacyCliClientEventId,
} from "../utils/pending-remote-logs.js";
import { pushPendingRemoteLogs } from "../utils/push-pending-remote.js";
import {
  getSupabaseCredentials,
  hasStoredSession,
  isRemoteConfigured,
} from "../utils/supabase-remote.js";

function enqueueLegacyLocalLogs(store) {
  const logs = store.get("logs") ?? [];
  let added = 0;
  logs.forEach((log, idx) => {
    const amount = log.amountMl ?? 0;
    if (amount <= 0) return;
    const client_event_id = log.clientEventId ?? legacyCliClientEventId(log, idx);
    const happened_at = log.timestamp;
    if (!happened_at) return;
    const row = {
      client_event_id,
      happened_at,
      amount_ml: amount,
      drink_type: log.drinkType?.trim() || "water",
    };
    const before = getPendingRemoteLogs(store).length;
    enqueueRemoteLog(store, row);
    const after = getPendingRemoteLogs(store).length;
    if (after > before) added += 1;
  });
  return added;
}

export function syncCommands(program) {
  const sync = program
    .command("sync")
    .description("Upload offline-queued drinks to Supabase (idempotent; never overwrites)");

  sync
    .command("push")
    .description("Flush the outbound queue to hydration_logs")
    .action(async () => {
      const store = getStore();
      try {
        const result = await pushPendingRemoteLogs(store, { verbose: false });
        if (result.skippedReason === "empty_queue") {
          console.log(chalk.dim("Nothing queued to upload."));
          return;
        }
        if (result.skippedReason === "missing_env") {
          console.log(
            chalk.yellow(
              "Supabase env not set. Local logs are still saved; set HYDROLOOP_SUPABASE_* to upload."
            )
          );
          return;
        }
        if (result.skippedReason === "not_logged_in") {
          console.log(
            chalk.yellow("Not signed in. hydroloop auth login <email> then hydroloop sync push")
          );
          return;
        }
        console.log(chalk.green(`Uploaded ${result.pushed} row(s) to cloud.`));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.error(chalk.red(`Upload failed (queued for retry): ${msg}`));
        process.exitCode = 1;
      }
    });

  sync.command("status").description("Show queue + remote config").action(() => {
    const store = getStore();
    const pending = getPendingRemoteLogs(store).length;
    const envOk = isRemoteConfigured();
    const session = hasStoredSession(store);

    console.log(`${chalk.bold("Pending upload:")} ${pending}`);
    console.log(`${chalk.bold("Supabase env:")} ${envOk ? chalk.green("ok") : chalk.red("missing")}`);
    console.log(
      `${chalk.bold("Local session:")} ${session ? chalk.green("saved") : chalk.dim("none")}`
    );

    const { url } = getSupabaseCredentials();
    if (url) console.log(`${chalk.dim("Project URL:")} ${url}`);
  });

  sync
    .command("enqueue-legacy")
    .description(
      "Queue existing local log history (deterministic ids; safe to run multiple times)"
    )
    .action(() => {
      const store = getStore();
      const n = enqueueLegacyLocalLogs(store);
      console.log(
        chalk.green(`Enqueued ${n} legacy row(s).`) +
          chalk.dim(" Run hydroloop sync push when online.")
      );
    });
}
