import chalk from "chalk";
import { getStore, parseAmount, updateDrink } from "../utils/storage.js";
import { pushPendingRemoteLogs } from "../utils/push-pending-remote.js";

export function updateCommand(program) {
  program
    .command("update <amount>")
    .description(
      "Update a previously logged drink amount (defaults to most recent log; local-first with cloud sync)."
    )
    .option("--id <clientEventId>", "Specific log id to update (clientEventId)")
    .option("-t, --type <type>", "Update drink type for the same row")
    .action(async (amountInput, opts) => {
      const amountMl = parseAmount(amountInput);
      if (amountMl == null || amountMl <= 0) {
        console.error(
          chalk.red("Invalid amount. Use values like 250, 500, 750ml or 1L.")
        );
        process.exitCode = 1;
        return;
      }

      const result = updateDrink(amountMl, {
        clientEventId: opts.id,
        drinkType: opts.type,
      });

      if (!result) {
        const msg = opts.id
          ? `No log found for id: ${opts.id}`
          : "No logs found to update. Use hydroloop add <amount> first.";
        console.error(chalk.red(msg));
        process.exitCode = 1;
        return;
      }

      const store = getStore();
      const goal = store.get("goal") ?? 2500;
      const { updatedLog, todayTotal } = result;

      console.log(
        `${chalk.cyan("✏️ Updated")} ${chalk.green(`${updatedLog.amountMl}ml`)} ` +
          chalk.dim(`(${updatedLog.clientEventId || "legacy local entry"})`)
      );
      console.log(
        `${chalk.bold("Today's total:")} ${chalk.green(
          `${todayTotal}ml`
        )} / ${chalk.blue(`${goal}ml`)}`
      );

      try {
        const r = await pushPendingRemoteLogs(store);
        if (r.pushed > 0) {
          console.log(chalk.dim(`Cloud: uploaded ${r.pushed} pending row(s).`));
        } else if (r.skippedReason === "not_logged_in" || r.skippedReason === "missing_env") {
          console.log(
            chalk.dim(
              "Cloud: skipped (offline or not signed in). Queue kept — run hydroloop sync push later."
            )
          );
        }
      } catch {
        console.log(
          chalk.dim(
            "Cloud: upload failed (network). Still saved locally — hydroloop sync push when online."
          )
        );
      }
    });
}
