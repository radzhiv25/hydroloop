import chalk from "chalk";
import { getStore, getTodayTotal } from "../utils/storage.js";
import { AVAILABLE_SOUNDS, getSelectedSound, isSoundEnabled } from "../utils/audio.js";

const REMINDER_PID_KEY = "reminderPid";

function buildProgressBar(current, goal, width = 20) {
  if (goal <= 0) return "";

  const ratio = Math.max(0, Math.min(1, current / goal));
  const filled = Math.round(ratio * width);

  const bar =
    "█".repeat(filled) +
    "░".repeat(Math.max(0, width - filled));

  const percent = Math.round(ratio * 100);
  return `${bar} ${percent}%`;
}

function isReminderRunning(store) {
  const pid = store.get(REMINDER_PID_KEY);
  if (!pid) return false;

  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function statusCommand(program) {
  program
    .command("status")
    .description("Show today's hydration status")
    .action(() => {
      const store = getStore();
      const goal = store.get("goal") ?? 2500;
      const todayTotal = getTodayTotal();
      const remaining = Math.max(0, goal - todayTotal);
      const reminderInterval = store.get("reminderInterval") ?? 45;
      const selectedSoundId = getSelectedSound();
      const selectedSound = AVAILABLE_SOUNDS.find((s) => s.id === selectedSoundId);
      const soundEnabled = isSoundEnabled();

      console.log(chalk.bold("\nHydration Status"));
      console.log(chalk.dim("----------------"));
      console.log(`${chalk.bold("Goal:")} ${goal}ml`);
      console.log(`${chalk.bold("Consumed:")} ${todayTotal}ml`);
      console.log(`${chalk.bold("Remaining:")} ${remaining}ml\n`);

      console.log(chalk.bold("Progress:"));
      console.log(chalk.green(buildProgressBar(todayTotal, goal)));

      const reminderRunning = isReminderRunning(store);

      console.log(chalk.bold("\nSettings"));
      console.log(chalk.dim("--------"));
      console.log(`${chalk.bold("Reminder:")} every ${reminderInterval} minutes`);
      console.log(
        `${chalk.bold("Sound:")} ${selectedSound?.name ?? selectedSoundId} ${
          soundEnabled ? chalk.green("(ON)") : chalk.red("(OFF)")
        }`
      );
      console.log(
        `${chalk.bold("Service:")} ${
          reminderRunning
            ? chalk.green("Running ✓")
            : chalk.dim("Not running")
        }`
      );
      console.log();
    });
}

