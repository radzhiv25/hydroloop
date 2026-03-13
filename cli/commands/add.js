import chalk from "chalk";
import { parseAmount, logDrink, getStore, getTodayTotal } from "../utils/storage.js";

export function addCommand(program) {
  program
    .command("add <amount>")
    .description("Log water intake (e.g. 250, 500, 1L)")
    .action((amountInput) => {
      const amountMl = parseAmount(amountInput);

      if (amountMl == null || amountMl <= 0) {
        console.error(
          chalk.red("Invalid amount. Use values like 250, 500, 750ml or 1L.")
        );
        process.exitCode = 1;
        return;
      }

      const { todayTotal } = logDrink(amountMl);
      const store = getStore();
      const goal = store.get("goal") ?? 2500;

      console.log(`${chalk.cyan("💧 Added")} ${chalk.green(`${amountMl}ml`)}`);
      console.log(
        `${chalk.bold("Today's total:")} ${chalk.green(
          `${todayTotal}ml`
        )} / ${chalk.blue(`${goal}ml`)}`
      );
    });
}

