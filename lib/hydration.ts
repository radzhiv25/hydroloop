import { format, subDays } from "date-fns";
import { getStreakHistory } from "./storage";

/** Returns an object keyed by date string (YYYY-MM-DD) with whether the user had at least one log that day. */
export function getLogDatesByDay(
  streakHistory: Record<string, boolean>,
  referenceDate: Date,
  windowDays = 42
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (let i = 0; i < windowDays; i++) {
    const d = subDays(referenceDate, i);
    const key = format(d, "yyyy-MM-dd");
    out[key] = streakHistory[key] ?? false;
  }
  return out;
}

/** Current streak: consecutive days (including today) with at least one log. */
export function getCurrentStreak(
  streakHistory: Record<string, boolean>,
  referenceDate: Date
): number {
  let count = 0;
  let d = new Date(referenceDate);
  while (streakHistory[format(d, "yyyy-MM-dd")]) {
    count++;
    d = subDays(d, 1);
  }
  return count;
}

/** Longest streak in history. */
export function getLongestStreak(
  streakHistory: Record<string, boolean>,
  referenceDate: Date,
  windowDays = 365
): number {
  let max = 0;
  let current = 0;
  for (let i = 0; i < windowDays; i++) {
    const d = subDays(referenceDate, i);
    const key = format(d, "yyyy-MM-dd");
    if (streakHistory[key]) {
      current++;
      max = Math.max(max, current);
    } else {
      current = 0;
    }
  }
  return max;
}
