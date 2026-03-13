import chalk from "chalk";
import { getStore, parseAmount, getTodayTotal } from "../utils/storage.js";

export function goalCommand(program) {
  program
    .command("goal <amount>")
    .description("Set your daily hydration goal")
    .action((amountInput) => {
      const amountMl = parseAmount(amountInput);

      if (amountMl == null || amountMl <= 0) {
        console.error(
          chalk.red("Invalid goal. Use values like 2000, 2500ml, or 2L.")
        );
        process.exitCode = 1;
        return;
      }

      const store = getStore();
      store.set("goal", amountMl);

      const todayTotal = getTodayTotal();

      console.log(
        `${chalk.bold("Daily goal set to:")} ${chalk.green(`${amountMl}ml`)}`
      );
      console.log(
        `${chalk.bold("Today's progress:")} ${todayTotal}ml / ${amountMl}ml`
      );
    });
}

