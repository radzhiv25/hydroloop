import chalk from "chalk";
import { stopReminderLoop } from "../utils/reminder.js";

export function stopCommand(program) {
  program
    .command("stop")
    .description("Attempt to stop background hydration reminders")
    .action(() => {
      const result = stopReminderLoop();

      if (result.stopped) {
        console.log(
          chalk.green(`✅ Hydroloop reminders stopped (PID: ${result.pid}).`)
        );
      } else if (result.reason === "no-pid") {
        console.log(
          chalk.yellow(
            "No active Hydroloop reminder process was recorded."
          )
        );
      } else if (result.reason === "not-running") {
        console.log(
          chalk.yellow(
            "Previous reminder process is no longer running (it may have crashed or been closed). Cleared stored PID."
          )
        );
      } else {
        console.log(
          chalk.red(
            "Tried to stop Hydroloop reminders, but the process could not be terminated."
          )
        );
      }
    });
}

