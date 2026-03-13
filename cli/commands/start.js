import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import { getStore } from "../utils/storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const REMINDER_PID_KEY = "reminderPid";

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function startCommand(program) {
  program
    .command("start")
    .description("Start background hydration reminders")
    .action(() => {
      const store = getStore();
      const existingPid = store.get(REMINDER_PID_KEY);

      if (existingPid && isProcessRunning(existingPid)) {
        console.log(
          chalk.yellow(
            `Hydroloop reminders are already running (PID: ${existingPid}).`
          )
        );
        console.log(
          chalk.dim(`Use ${chalk.white("hydroloop stop")} to stop them first.`)
        );
        return;
      }

      const daemonPath = path.join(__dirname, "..", "bin", "daemon.js");
      const intervalMinutes = store.get("reminderInterval") ?? 45;

      const child = spawn("node", [daemonPath], {
        detached: true,
        stdio: "ignore",
      });

      child.unref();

      console.log(
        `${chalk.green("✓")} Hydroloop reminders started in background (PID: ${child.pid})`
      );
      console.log(
        `${chalk.dim("Reminder every")} ${chalk.cyan(`${intervalMinutes} minutes`)}`
      );
      console.log(
        chalk.dim(`Use ${chalk.white("hydroloop stop")} to stop reminders.`)
      );
    });
}

