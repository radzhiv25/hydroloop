"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserData } from "@/lib/types";
import type { WeeklyDaySummary } from "@/lib/types";
import {
  getOrCreateUserData,
  saveUserData,
  deleteLog as deleteLogStorage,
  ensureDailyReset,
  getStreakHistory,
  getWeeklyHistory,
} from "@/lib/storage";
import { getCurrentStreak, getLongestStreak } from "@/lib/hydration";
import {
  deleteHydrationLogFromCloud,
  persistHydrationLogToCloud,
  syncCloudDataToLocal,
} from "@/lib/cloud-sync";

export function useHydration() {
  const [data, setData] = useState<UserData | null>(null);
  const [streakHistory, setStreakHistory] = useState<Record<string, boolean>>({});
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyDaySummary[]>([]);

  const load = useCallback(async () => {
    await syncCloudDataToLocal();
    const next = await getOrCreateUserData();
    const reset = ensureDailyReset(next);
    if (JSON.stringify(reset) !== JSON.stringify(next)) {
      await saveUserData(reset);
    }
    setData(reset);
    setStreakHistory(await getStreakHistory());
    setWeeklyHistory(await getWeeklyHistory());
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const addWater = useCallback(
    async (amount: number, time?: string, drinkType?: string) => {
      if (!data) return;
      const now = new Date();
      const entryTime =
        time ??
        `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const result = await persistHydrationLogToCloud(nextDate(data), {
        time: entryTime,
        amount,
        drinkType: drinkType ?? "water",
      });
      if (!result.synced) {
        console.error("Failed to persist hydration log to cloud:", result.reason);
        return;
      }

      const next = {
        ...data,
        water_consumed: data.water_consumed + amount,
        num_times_consumed: data.num_times_consumed + 1,
        logs: [...data.logs, result.entry],
      };
      await saveUserData(next);
      setData(next);
      setStreakHistory(await getStreakHistory());
    },
    [data]
  );

  const setDailyGoal = useCallback((goal: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, daily_goal: Math.max(500, Math.min(5000, goal)) };
      void saveUserData(next);
      return next;
    });
  }, []);

  const deleteLog = useCallback((index: number) => {
    void (async () => {
      const current = data;
      if (!current) return;
      const entry = current.logs[index];
      if (!entry) return;

      if (entry.clientEventId) {
        const result = await deleteHydrationLogFromCloud(entry.clientEventId);
        if (!result.synced) {
          console.error("Failed to delete hydration log from cloud:", result.reason);
          return;
        }
      }

      setData((prev) => {
        if (!prev) return prev;
        const next = deleteLogStorage(prev, index);
        void saveUserData(next);
        return next;
      });
    })();
    void (async () => {
      setStreakHistory(await getStreakHistory());
    })();
  }, [data]);

  const updateSettings = useCallback((updates: Partial<UserData>) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      void saveUserData(next);
      return next;
    });
  }, []);

  const refetch = useCallback(() => {
    load();
  }, [load]);

  const now = new Date();
  const currentStreak = data ? getCurrentStreak(streakHistory, now) : 0;
  const longestStreak = data ? getLongestStreak(streakHistory, now) : 0;

  return {
    data,
    addWater,
    setDailyGoal,
    deleteLog,
    updateSettings,
    refetch,
    streakHistory,
    weeklyHistory,
    currentStreak,
    longestStreak,
  };
}

function nextDate(data: UserData) {
  return data.date;
}
