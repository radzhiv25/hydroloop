import chalk from "chalk";
import { getStore } from "../utils/storage.js";

export function reminderCommand(program) {
  program
    .command("reminder <minutes>")
    .description("Set reminder interval in minutes (e.g. 30, 45, 60)")
    .action((minutes) => {
      const interval = Number.parseInt(minutes, 10);

      if (Number.isNaN(interval) || interval < 1) {
        console.error(
          chalk.red("Invalid interval. Please provide a number of minutes (e.g. 30, 45, 60).")
        );
        process.exitCode = 1;
        return;
      }

      if (interval > 180) {
        console.log(
          chalk.yellow("⚠️  That's a long interval! Consider shorter reminders for better hydration.")
        );
      }

      const store = getStore();
      store.set("reminderInterval", interval);

      console.log(
        `${chalk.green("✓")} Reminder interval set to ${chalk.cyan(`${interval} minutes`)}`
      );
      console.log(
        chalk.dim(`Reminders will trigger every ${interval} minutes when you run ${chalk.white("hydroloop start")}`)
      );
    });
}
