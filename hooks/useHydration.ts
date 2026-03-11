"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserData } from "@/lib/types";
import type { WeeklyDaySummary } from "@/lib/types";
import {
  getOrCreateUserData,
  saveUserData,
  updateWater as updateWaterStorage,
  deleteLog as deleteLogStorage,
  ensureDailyReset,
  getStreakHistory,
  getWeeklyHistory,
} from "@/lib/storage";
import { getCurrentStreak, getLongestStreak } from "@/lib/hydration";

export function useHydration() {
  const [data, setData] = useState<UserData | null>(null);
  const [streakHistory, setStreakHistory] = useState<Record<string, boolean>>({});
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklyDaySummary[]>([]);

  const load = useCallback(() => {
    const next = getOrCreateUserData();
    const reset = ensureDailyReset(next);
    if (JSON.stringify(reset) !== JSON.stringify(next)) saveUserData(reset);
    setData(reset);
    setStreakHistory(getStreakHistory());
    setWeeklyHistory(getWeeklyHistory());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const addWater = useCallback(
    (amount: number, time?: string, drinkType?: string) => {
      if (!data) return;
      const next = updateWaterStorage(data, amount, time, drinkType);
      saveUserData(next);
      setData(next);
      setStreakHistory(getStreakHistory());
    },
    [data]
  );

  const setDailyGoal = useCallback((goal: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, daily_goal: Math.max(500, Math.min(5000, goal)) };
      saveUserData(next);
      return next;
    });
  }, []);

  const deleteLog = useCallback((index: number) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = deleteLogStorage(prev, index);
      saveUserData(next);
      return next;
    });
    setStreakHistory(getStreakHistory());
  }, []);

  const updateSettings = useCallback((updates: Partial<UserData>) => {
    setData((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      saveUserData(next);
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
