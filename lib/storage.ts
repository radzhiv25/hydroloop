import type { UserData, WaterLogEntry, WeeklyDaySummary, ChartType, DetailedLogHistory } from "./types";
import { kvGet, kvRemove, kvSet } from "./db";
import {
  STORAGE_KEY,
  STREAK_HISTORY_KEY,
  WEEKLY_HISTORY_KEY,
  DETAILED_LOG_HISTORY_KEY,
  WEEKLY_HISTORY_DAYS,
  DEFAULT_DAILY_GOAL,
  DEFAULT_TIME_SPAN,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_REMINDER_DAYS,
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_DURATION,
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
} from "@/constants/hydration";
import { normalizeReminderDays } from "@/lib/reminder-weekdays";
import { aggregateLogsToRecord } from "@/lib/drink-aggregation";

/** Removes all app data from IndexedDB (user data, streaks, weekly history). */
export async function clearAllData(): Promise<void> {
  if (typeof window === "undefined") return;
  await Promise.all([
    kvRemove(STORAGE_KEY),
    kvRemove(STREAK_HISTORY_KEY),
    kvRemove(WEEKLY_HISTORY_KEY),
    kvRemove(DETAILED_LOG_HISTORY_KEY),
  ]);
}

function getTodayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function createDefaultData(date: string): UserData {
  return {
    name: "",
    profileImage: "",
    reminder_interval: DEFAULT_REMINDER_INTERVAL,
    reminder_sound: DEFAULT_REMINDER_SOUND,
    reminder_sound_duration_seconds: DEFAULT_REMINDER_SOUND_DURATION,
    time_span: { ...DEFAULT_TIME_SPAN },
    reminder_days: [...DEFAULT_REMINDER_DAYS],
    daily_goal: DEFAULT_DAILY_GOAL,
    water_consumed: 0,
    num_times_consumed: 0,
    logs: [],
    date,
    chart_type: DEFAULT_CHART_TYPE,
    color_palette: DEFAULT_COLOR_PALETTE,
    custom_drink_presets: [],
  };
}

const VALID_CHART_TYPES: ChartType[] = ["line", "bar", "area", "radar", "radial"];

export async function getUserData(): Promise<UserData | null> {
  if (typeof window === "undefined") return null;
  try {
    const raw = await kvGet(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Omit<UserData, "chart_type"> & { chart_type?: string };
    const ct = parsed.chart_type;
    if (ct === "pie" || (ct != null && !VALID_CHART_TYPES.includes(ct as ChartType))) {
      parsed.chart_type = DEFAULT_CHART_TYPE;
    }
    const withDays = parsed as UserData;
    withDays.reminder_days = normalizeReminderDays(withDays.reminder_days);
    return withDays;
  } catch {
    return null;
  }
}

export async function saveUserData(data: UserData): Promise<void> {
  if (typeof window === "undefined") return;
  await kvSet(STORAGE_KEY, JSON.stringify(data));
}

export async function getOrCreateUserData(): Promise<UserData> {
  const today = getTodayISO();
  const existing = await getUserData();
  if (existing?.date === today) return existing;
  if (existing) {
    const reset = resetDailyData(existing);
    return reset;
  }
  return createDefaultData(today);
}

export async function getStreakHistory(): Promise<Record<string, boolean>> {
  if (typeof window === "undefined") return {};
  try {
    const raw = await kvGet(STREAK_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function setStreakHistory(history: Record<string, boolean>): Promise<void> {
  if (typeof window === "undefined") return;
  await kvSet(STREAK_HISTORY_KEY, JSON.stringify(history));
}

export async function markDayAsLogged(dateStr: string): Promise<void> {
  const history = await getStreakHistory();
  history[dateStr] = true;
  await setStreakHistory(history);
}

export async function getWeeklyHistory(): Promise<WeeklyDaySummary[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = await kvGet(WEEKLY_HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function getDetailedLogHistory(): Promise<DetailedLogHistory> {
  if (typeof window === "undefined") return {};
  try {
    const raw = await kvGet(DETAILED_LOG_HISTORY_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as DetailedLogHistory;
  } catch {
    return {};
  }
}

async function setDetailedLogHistory(history: DetailedLogHistory): Promise<void> {
  if (typeof window === "undefined") return;
  await kvSet(DETAILED_LOG_HISTORY_KEY, JSON.stringify(history));
}

async function persistDetailedLogsForDay(date: string, logs: WaterLogEntry[]): Promise<void> {
  if (!date || logs.length === 0) return;
  try {
    const history = await getDetailedLogHistory();
    history[date] = logs.map((entry) => ({ ...entry }));
    await setDetailedLogHistory(history);
  } catch {
    // ignore
  }
}

async function pushWeeklyHistory(day: WeeklyDaySummary): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    const list = await getWeeklyHistory();
    const next = [...list, day].slice(-WEEKLY_HISTORY_DAYS);
    await kvSet(WEEKLY_HISTORY_KEY, JSON.stringify(next));
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
  void markDayAsLogged(data.date);
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
  if (data.logs.length > 0) void markDayAsLogged(data.date);
  if (data.logs.length > 0) void persistDetailedLogsForDay(data.date, data.logs);
  void pushWeeklyHistory({
    date: data.date,
    water_consumed: data.water_consumed,
    daily_goal: data.daily_goal,
    by_drink: aggregateLogsToRecord(data.logs),
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
