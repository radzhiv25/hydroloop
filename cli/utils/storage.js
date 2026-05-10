import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Conf from "conf";
import { enqueueRemoteLog, upsertPendingRemoteLog } from "./pending-remote-logs.js";

const fromEnv =
  typeof process.env.HYDROLOOP_CONFIG_DIR === "string"
    ? process.env.HYDROLOOP_CONFIG_DIR.trim()
    : "";
const configDir = fromEnv || path.join(os.homedir(), ".config", "hydroloop");

try {
  fs.mkdirSync(configDir, { recursive: true });
} catch {
  // homedir not writable — Conf may fail on first persist
}

const config = new Conf({
  projectName: "hydroloop",
  cwd: configDir,
  defaults: {
    goal: 2500,
    reminderInterval: 45,
    logs: [],
    streak: 0,
    longestStreak: 0,
    lastDrinkDate: null,
    weightKg: null,
    selectedSound: "hydroloop_1",
    soundEnabled: true,
    soundDuration: 5,
    /** JS weekday 0–Sun … 6–Sat; reminders only on these days. */
    reminderDays: [0, 1, 2, 3, 4, 5, 6],
    /** @type {{ client_event_id: string, happened_at: string, amount_ml: number, drink_type: string }[]} */
    pending_remote_logs: [],
  },
});

export function getStore() {
  return config;
}

export function getTodayKey() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}

export function parseAmount(amountInput) {
  const trimmed = String(amountInput).trim().toLowerCase();

  if (trimmed.endsWith("ml")) {
    const value = Number.parseFloat(trimmed.replace("ml", ""));
    return Number.isNaN(value) ? null : Math.round(value);
  }

  if (trimmed.endsWith("l")) {
    const value = Number.parseFloat(trimmed.replace("l", ""));
    return Number.isNaN(value) ? null : Math.round(value * 1000);
  }

  const numeric = Number.parseFloat(trimmed);
  if (!Number.isNaN(numeric)) {
    return Math.round(numeric);
  }

  return null;
}

/**
 * @param {number} amountMl
 * @param {{ drinkType?: string }} [opts]
 */
export function logDrink(amountMl, opts = {}) {
  const store = getStore();
  const todayKey = getTodayKey();

  const logs = store.get("logs") ?? [];
  const now = new Date();
  const drinkType = opts.drinkType?.trim() || "water";
  const clientEventId = `cli:${randomUUID()}`;

  logs.push({
    date: todayKey,
    timestamp: now.toISOString(),
    amountMl,
    drinkType,
    clientEventId,
  });

  store.set("logs", logs);
  store.set("lastDrinkDate", todayKey);

  const todayTotal = logs
    .filter((log) => log.date === todayKey)
    .reduce((sum, log) => sum + (log.amountMl ?? 0), 0);

  updateStreak(store, logs);

  enqueueRemoteLog(store, {
    client_event_id: clientEventId,
    happened_at: now.toISOString(),
    amount_ml: amountMl,
    drink_type: drinkType,
  });

  return { todayTotal, clientEventId };
}

function updateStreak(store, logs) {
  const datesWithDrinks = new Set(logs.map((log) => log.date));
  if (datesWithDrinks.size === 0) {
    store.set("streak", 0);
    return;
  }

  const sortedDates = Array.from(datesWithDrinks).sort();
  let currentStreak = 1;
  let longestStreak = store.get("longestStreak") ?? 0;

  for (let i = sortedDates.length - 2; i >= 0; i -= 1) {
    const current = new Date(sortedDates[i]);
    const next = new Date(sortedDates[i + 1]);
    const diffDays = (next - current) / (1000 * 60 * 60 * 24);

    if (diffDays === 1) {
      currentStreak += 1;
    } else if (diffDays > 1) {
      break;
    }
  }

  const todayKey = getTodayKey();
  if (!datesWithDrinks.has(todayKey)) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().slice(0, 10);
    if (!datesWithDrinks.has(yesterdayKey)) {
      currentStreak = 0;
    }
  }

  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  store.set("streak", currentStreak);
  store.set("longestStreak", longestStreak);
}

export function getTodayTotal() {
  const store = getStore();
  const todayKey = getTodayKey();
  const logs = store.get("logs") ?? [];

  return logs
    .filter((log) => log.date === todayKey)
    .reduce((sum, log) => sum + (log.amountMl ?? 0), 0);
}

/**
 * Update an existing local log row by client_event_id or most recent item.
 * Re-queues the same event id for cloud upsert if present.
 * @param {number} amountMl
 * @param {{ drinkType?: string, clientEventId?: string }} [opts]
 * @returns {{ updatedLog: any, todayTotal: number } | null}
 */
export function updateDrink(amountMl, opts = {}) {
  const store = getStore();
  const logs = store.get("logs") ?? [];
  if (logs.length === 0) return null;

  const clientEventId = opts.clientEventId?.trim();
  const targetIndex =
    clientEventId != null && clientEventId.length > 0
      ? logs.findIndex((log) => log.clientEventId === clientEventId)
      : logs.length - 1;

  if (targetIndex < 0) return null;

  const existing = logs[targetIndex];
  const updatedLog = {
    ...existing,
    amountMl,
    drinkType: opts.drinkType?.trim() || existing.drinkType || "water",
  };
  logs[targetIndex] = updatedLog;
  store.set("logs", logs);
  updateStreak(store, logs);

  if (updatedLog.clientEventId && updatedLog.timestamp) {
    upsertPendingRemoteLog(store, {
      client_event_id: updatedLog.clientEventId,
      happened_at: updatedLog.timestamp,
      amount_ml: updatedLog.amountMl,
      drink_type: updatedLog.drinkType || "water",
    });
  }

  const todayTotal = getTodayTotal();
  return { updatedLog, todayTotal };
}

