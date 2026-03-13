import chalk from "chalk";
import { getStore, getTodayKey, getTodayTotal } from "../utils/storage.js";

export function summaryCommand(program) {
  program
    .command("summary")
    .description("Show today's hydration summary")
    .action(() => {
      const store = getStore();
      const todayKey = getTodayKey();
      const logs = store.get("logs") ?? [];

      const todayLogs = logs.filter((log) => log.date === todayKey);
      const todayTotal = getTodayTotal();
      const goal = store.get("goal") ?? 2500;

      console.log(chalk.bold("\nDaily Hydration Report\n"));
      console.log(`${chalk.bold("Total:")} ${todayTotal}ml`);
      console.log(`${chalk.bold("Goal:")} ${goal}ml`);
      console.log(`${chalk.bold("Times Drank:")} ${todayLogs.length}\n`);

      if (todayTotal >= goal) {
        console.log(chalk.green("Amazing work today 💧 You hit your goal!"));
      } else if (todayTotal >= goal * 0.7) {
        console.log(
          chalk.cyan("Almost there 💧 A couple more sips to reach your goal.")
        );
      } else {
        console.log(
          chalk.yellow(
            "Plenty of room to hydrate 💧 Keep a bottle nearby while you code."
          )
        );
      }

      console.log();
    });
}

