import chalk from "chalk";
import { parseAmount, logDrink, getStore } from "../utils/storage.js";
import { pushPendingRemoteLogs } from "../utils/push-pending-remote.js";

export function addCommand(program) {
  program
    .command("add <amount>")
    .description("Log water intake (e.g. 250, 500, 1L). Always saved locally; cloud upload is best-effort.")
    .option("-t, --type <type>", "Drink type for cloud row (default: water)", "water")
    .action(async (amountInput, opts) => {
      const amountMl = parseAmount(amountInput);

      if (amountMl == null || amountMl <= 0) {
        console.error(
          chalk.red("Invalid amount. Use values like 250, 500, 750ml or 1L.")
        );
        process.exitCode = 1;
        return;
      }

      const { todayTotal } = logDrink(amountMl, { drinkType: opts.type });
      const store = getStore();
      const goal = store.get("goal") ?? 2500;

      console.log(`${chalk.cyan("💧 Added")} ${chalk.green(`${amountMl}ml`)}`);
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

