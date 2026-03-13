import notifier from "node-notifier";
import ora from "ora";
import chalk from "chalk";
import { getStore, getTodayTotal } from "./storage.js";
import { playReminderSound } from "./audio.js";

const REMINDER_PID_KEY = "reminderPid";

export function startReminderLoop() {
  const store = getStore();
  const intervalMinutes = store.get("reminderInterval") ?? 45;

  const spinner = ora("Starting Hydroloop reminders...").start();
  store.set(REMINDER_PID_KEY, process.pid);

  spinner.succeed(
    `Hydroloop reminders running every ${intervalMinutes} minutes. Use ${chalk.yellow(
      "hydroloop stop"
    )} to attempt to stop them.`
  );

  const intervalMs = intervalMinutes * 60 * 1000;

  const tick = async () => {
    const goal = store.get("goal") ?? 2500;
    const todayTotal = getTodayTotal();

    if (todayTotal >= goal) {
      return;
    }

    const remaining = goal - todayTotal;

    try {
      notifier.notify({
        title: "Hydroloop Reminder 💧",
        message: `Time to drink water.\nRemaining today: ${remaining}ml`,
        timeout: 5,
      });
    } catch {
      // Desktop notifications unavailable (e.g. missing terminal-notifier on macOS ARM).
      // Continue with terminal output and sound.
    }

    process.stdout.write(
      `\n${chalk.cyan("💧 Hydroloop Reminder")} ${chalk.dim(
        "- Time to drink water."
      )} Remaining today: ${chalk.green(`${remaining}ml`)}\n`
    );

    await playReminderSound();
  };

  tick();
  setInterval(tick, intervalMs);
}

export function stopReminderLoop() {
  const store = getStore();
  const pid = store.get(REMINDER_PID_KEY);

  if (!pid) {
    return { stopped: false, reason: "no-pid" };
  }

  try {
    process.kill(pid, 0);
  } catch {
    store.delete(REMINDER_PID_KEY);
    return { stopped: false, reason: "not-running" };
  }

  try {
    process.kill(pid, "SIGTERM");
    store.delete(REMINDER_PID_KEY);
    return { stopped: true, pid };
  } catch (error) {
    store.delete(REMINDER_PID_KEY);
    return { stopped: false, reason: "kill-failed", error };
  }
}

