#!/usr/bin/env node
import notifier from "node-notifier";
import chalk from "chalk";
import { getStore, getTodayTotal } from "../utils/storage.js";
import { playReminderSound } from "../utils/audio.js";

const REMINDER_PID_KEY = "reminderPid";

const store = getStore();
const intervalMinutes = store.get("reminderInterval") ?? 45;

store.set(REMINDER_PID_KEY, process.pid);

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
    // Desktop notifications unavailable
  }

  await playReminderSound();
};

tick();
setInterval(tick, intervalMs);

process.on("SIGTERM", () => {
  store.delete(REMINDER_PID_KEY);
  process.exit(0);
});

process.on("SIGINT", () => {
  // Ignore Ctrl+C - only stop via hydroloop stop
});
