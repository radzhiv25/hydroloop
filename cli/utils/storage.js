import Conf from "conf";

const config = new Conf({
  projectName: "hydroloop",
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

export function logDrink(amountMl) {
  const store = getStore();
  const todayKey = getTodayKey();

  const logs = store.get("logs") ?? [];
  const now = new Date();

  logs.push({
    date: todayKey,
    timestamp: now.toISOString(),
    amountMl,
  });

  store.set("logs", logs);
  store.set("lastDrinkDate", todayKey);

  const todayTotal = logs
    .filter((log) => log.date === todayKey)
    .reduce((sum, log) => sum + (log.amountMl ?? 0), 0);

  updateStreak(store, logs);

  return { todayTotal };
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

