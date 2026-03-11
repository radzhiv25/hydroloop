import type { UserData, WaterLogEntry, WeeklyDaySummary, ChartType } from "./types";
import {
  STORAGE_KEY,
  STREAK_HISTORY_KEY,
  WEEKLY_HISTORY_KEY,
  WEEKLY_HISTORY_DAYS,
  DEFAULT_DAILY_GOAL,
  DEFAULT_TIME_SPAN,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
} from "@/constants/hydration";

/** Removes all app data from localStorage (user data, streaks, weekly history). */
export function clearAllData(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STREAK_HISTORY_KEY);
    localStorage.removeItem(WEEKLY_HISTORY_KEY);
  } catch {
    // ignore
  }
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultData(date: string): UserData {
  return {
    name: "",
    profileImage: "",
    reminder_interval: DEFAULT_REMINDER_INTERVAL,
    time_span: { ...DEFAULT_TIME_SPAN },
    daily_goal: DEFAULT_DAILY_GOAL,
    water_consumed: 0,
    num_times_consumed: 0,
    logs: [],
    date,
    chart_type: DEFAULT_CHART_TYPE,
    color_palette: DEFAULT_COLOR_PALETTE,
  };
}

const VALID_CHART_TYPES: ChartType[] = ["line", "bar", "area", "radar", "radial"];

export function getUserData(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Omit<UserData, "chart_type"> & { chart_type?: string };
    const ct = parsed.chart_type;
    if (ct === "pie" || (ct != null && !VALID_CHART_TYPES.includes(ct as ChartType))) {
      parsed.chart_type = DEFAULT_CHART_TYPE;
    }
    return parsed as UserData;
  } catch {
    return null;
  }
}

export function saveUserData(data: UserData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function getOrCreateUserData(): UserData {
  const today = getTodayISO();
  const existing = getUserData();
  if (existing?.date === today) return existing;
  if (existing) {
    const reset = resetDailyData(existing);
    return reset;
  }
  return createDefaultData(today);
}

export function getStreakHistory(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STREAK_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function setStreakHistory(history: Record<string, boolean>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STREAK_HISTORY_KEY, JSON.stringify(history));
  } catch {
    // ignore
  }
}

export function markDayAsLogged(dateStr: string): void {
  const history = getStreakHistory();
  history[dateStr] = true;
  setStreakHistory(history);
}

export function getWeeklyHistory(): WeeklyDaySummary[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(WEEKLY_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function pushWeeklyHistory(day: WeeklyDaySummary): void {
  if (typeof window === "undefined") return;
  try {
    const list = getWeeklyHistory();
    const next = [...list, day].slice(-WEEKLY_HISTORY_DAYS);
    localStorage.setItem(WEEKLY_HISTORY_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function updateWater(
  data: UserData,
  amount: number,
  time?: string,
  drinkType?: string
): UserData {
  const now = new Date();
  const timeStr = time ?? `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const entry: WaterLogEntry = { time: timeStr, amount, drinkType: drinkType ?? "water" };
  markDayAsLogged(data.date);
  return {
    ...data,
    water_consumed: data.water_consumed + amount,
    num_times_consumed: data.num_times_consumed + 1,
    logs: [...data.logs, entry],
  };
}

export function deleteLog(data: UserData, index: number): UserData {
  if (index < 0 || index >= data.logs.length) return data;
  const entry = data.logs[index];
  const newLogs = data.logs.filter((_, i) => i !== index);
  return {
    ...data,
    water_consumed: Math.max(0, data.water_consumed - entry.amount),
    num_times_consumed: Math.max(0, data.num_times_consumed - 1),
    logs: newLogs,
  };
}

export function resetDailyData(data: UserData): UserData {
  const today = getTodayISO();
  if (data.logs.length > 0) markDayAsLogged(data.date);
  pushWeeklyHistory({
    date: data.date,
    water_consumed: data.water_consumed,
    daily_goal: data.daily_goal,
  });
  return {
    ...data,
    date: today,
    water_consumed: 0,
    num_times_consumed: 0,
    logs: [],
  };
}

export function ensureDailyReset(data: UserData): UserData {
  const today = getTodayISO();
  if (data.date === today) return data;
  return resetDailyData(data);
}
