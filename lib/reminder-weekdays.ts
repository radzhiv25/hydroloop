import { DEFAULT_REMINDER_DAYS } from "@/constants/hydration";

/** Coerce stored reminder days to a valid non-empty subset of 0–6. */
export function normalizeReminderDays(days: number[] | undefined): number[] {
  if (!days?.length) return [...DEFAULT_REMINDER_DAYS];
  const unique = [...new Set(days)].filter((d) => Number.isInteger(d) && d >= 0 && d <= 6);
  unique.sort((a, b) => a - b);
  return unique.length ? unique : [...DEFAULT_REMINDER_DAYS];
}
