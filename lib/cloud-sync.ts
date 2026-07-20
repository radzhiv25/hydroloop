import type { DetailedLogHistory, UserData, WaterLogEntry, WeeklyDaySummary } from "@/lib/types";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import {
  getOrCreateUserData,
  saveUserData,
  setDetailedLogHistory,
  setStreakHistory,
  setWeeklyHistory,
} from "@/lib/storage";
import {
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
  DEFAULT_DAILY_GOAL,
  DEFAULT_REMINDER_DAYS,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_DURATION,
  DEFAULT_TIME_SPAN,
  WEEKLY_HISTORY_DAYS,
} from "@/constants/hydration";
import { normalizeReminderDays } from "@/lib/reminder-weekdays";
import { aggregateLogsToRecord } from "@/lib/drink-aggregation";

type RemoteLogRow = {
  client_event_id: string | null;
  happened_at: string;
  amount_ml: number;
  drink_type: string | null;
};

type RemoteSettingsRow = {
  reminder_interval_mins: number | null;
  reminder_days: number[] | null;
  time_span_start: string | null;
  time_span_end: string | null;
  daily_goal_ml: number | null;
  chart_type: UserData["chart_type"] | null;
  color_palette: UserData["color_palette"] | null;
  custom_chart_colors: UserData["custom_chart_colors"] | null;
  custom_drink_presets: string[] | null;
};

type PersistLogResult =
  | { synced: true; entry: WaterLogEntry }
  | { synced: false; reason: string };

function toTimeHHMM(isoLike: string) {
  if (!isoLike) return "12:00";
  if (isoLike.includes("T")) {
    const date = new Date(isoLike);
    if (!Number.isNaN(date.getTime())) {
      const hh = String(date.getHours()).padStart(2, "0");
      const mm = String(date.getMinutes()).padStart(2, "0");
      return `${hh}:${mm}`;
    }
  }
  return isoLike.slice(0, 5);
}

function dayKeyFromISOString(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function clampGoal(value: number | null | undefined) {
  if (value == null) return DEFAULT_DAILY_GOAL;
  return Math.max(500, Math.min(5000, Math.round(value)));
}

function toLocalDailyLogs(rows: RemoteLogRow[]) {
  const byDate: Record<string, WaterLogEntry[]> = {};
  rows.forEach((row) => {
    const date = dayKeyFromISOString(row.happened_at);
    if (!date || !Number.isFinite(row.amount_ml) || row.amount_ml <= 0) return;
    if (!byDate[date]) byDate[date] = [];
    byDate[date].push({
      time: toTimeHHMM(row.happened_at),
      amount: Math.round(row.amount_ml),
      drinkType: row.drink_type?.trim() || "water",
      clientEventId: row.client_event_id ?? undefined,
    });
  });
  return byDate;
}

function toIsoTimestamp(date: string, time: string) {
  const hhmm = time?.slice(0, 5) || "12:00";
  const stamp = new Date(`${date}T${hhmm}:00`);
  if (!Number.isNaN(stamp.getTime())) {
    return stamp.toISOString();
  }
  return new Date(`${date}T12:00:00`).toISOString();
}

function createClientEventId(date: string, entry: WaterLogEntry) {
  const randomPart =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2)}`;

  return `web:${date}:${entry.time}:${entry.amount}:${entry.drinkType ?? "water"}:${randomPart}`;
}

export async function persistHydrationLogToCloud(
  date: string,
  entry: WaterLogEntry
): Promise<PersistLogResult> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { synced: false, reason: "not_configured" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { synced: false, reason: "not_signed_in" };
  }

  const row = {
    user_id: user.id,
    happened_at: toIsoTimestamp(date, entry.time),
    amount_ml: entry.amount,
    drink_type: entry.drinkType?.trim() || "water",
    source: "web" as const,
    client_event_id: createClientEventId(date, entry),
  };

  const { error } = await supabase
    .from("hydration_logs")
    .upsert([row], { onConflict: "user_id,client_event_id", ignoreDuplicates: true });

  if (error) {
    return { synced: false, reason: error.message };
  }

  return {
    synced: true,
    entry: {
      ...entry,
      drinkType: row.drink_type,
      clientEventId: row.client_event_id,
    },
  };
}

export async function deleteHydrationLogFromCloud(clientEventId: string): Promise<{ synced: boolean; reason?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { synced: false, reason: "not_configured" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { synced: false, reason: "not_signed_in" };
  }

  const { error } = await supabase
    .from("hydration_logs")
    .delete()
    .eq("user_id", user.id)
    .eq("client_event_id", clientEventId);

  if (error) {
    return { synced: false, reason: error.message };
  }

  return { synced: true };
}

function weeklySummaryFromHistory(history: DetailedLogHistory, dailyGoal: number): WeeklyDaySummary[] {
  const sortedDates = Object.keys(history).sort();
  const recentDates = sortedDates.slice(-WEEKLY_HISTORY_DAYS);
  return recentDates.map((date) => {
    const logs = history[date] ?? [];
    return {
      date,
      water_consumed: logs.reduce((sum, log) => sum + (log.amount ?? 0), 0),
      daily_goal: dailyGoal,
      by_drink: aggregateLogsToRecord(logs),
    };
  });
}

export async function syncCloudDataToLocal(): Promise<{ synced: boolean; reason?: string }> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) {
    return { synced: false, reason: "not_configured" };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { synced: false, reason: "not_signed_in" };
  }

  const [logsRes, settingsRes, localBase] = await Promise.all([
    supabase
      .from("hydration_logs")
      .select("client_event_id, happened_at, amount_ml, drink_type")
      .eq("user_id", user.id)
      .order("happened_at", { ascending: true }),
    supabase
      .from("user_settings")
      .select(
        "reminder_interval_mins, reminder_days, time_span_start, time_span_end, daily_goal_ml, chart_type, color_palette, custom_chart_colors, custom_drink_presets"
      )
      .eq("user_id", user.id)
      .maybeSingle<RemoteSettingsRow>(),
    getOrCreateUserData(),
  ]);

  if (logsRes.error) {
    return { synced: false, reason: logsRes.error.message };
  }

  const historyByDate = toLocalDailyLogs((logsRes.data ?? []) as RemoteLogRow[]);
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = historyByDate[today] ?? [];
  delete historyByDate[today];

  const settings = settingsRes.data;
  const merged: UserData = {
    ...localBase,
    date: today,
    logs: todayLogs,
    water_consumed: todayLogs.reduce((sum, log) => sum + (log.amount ?? 0), 0),
    num_times_consumed: todayLogs.length,
    reminder_interval: settings?.reminder_interval_mins ?? localBase.reminder_interval ?? DEFAULT_REMINDER_INTERVAL,
    reminder_days: normalizeReminderDays(settings?.reminder_days ?? localBase.reminder_days ?? [...DEFAULT_REMINDER_DAYS]),
    time_span: {
      start: settings?.time_span_start?.slice(0, 5) ?? localBase.time_span?.start ?? DEFAULT_TIME_SPAN.start,
      end: settings?.time_span_end?.slice(0, 5) ?? localBase.time_span?.end ?? DEFAULT_TIME_SPAN.end,
    },
    daily_goal: clampGoal(settings?.daily_goal_ml ?? localBase.daily_goal),
    chart_type: settings?.chart_type ?? localBase.chart_type ?? DEFAULT_CHART_TYPE,
    color_palette: settings?.color_palette ?? localBase.color_palette ?? DEFAULT_COLOR_PALETTE,
    custom_chart_colors: settings?.custom_chart_colors ?? localBase.custom_chart_colors,
    custom_drink_presets: settings?.custom_drink_presets ?? localBase.custom_drink_presets ?? [],
    reminder_sound: localBase.reminder_sound ?? DEFAULT_REMINDER_SOUND,
    reminder_sound_duration_seconds:
      localBase.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
    custom_sound_url: localBase.custom_sound_url,
  };

  const streakHistory: Record<string, boolean> = {};
  Object.keys(historyByDate).forEach((date) => {
    if ((historyByDate[date] ?? []).length > 0) streakHistory[date] = true;
  });
  if (todayLogs.length > 0) streakHistory[today] = true;

  await Promise.all([
    saveUserData(merged),
    setDetailedLogHistory(historyByDate),
    setWeeklyHistory(weeklySummaryFromHistory(historyByDate, merged.daily_goal)),
    setStreakHistory(streakHistory),
  ]);

  return { synced: true };
}
