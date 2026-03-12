"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { getLogDatesByDay } from "@/lib/hydration";

type StreakCalendarProps = {
  streakHistory: Record<string, boolean>;
  currentStreak: number;
  longestStreak: number;
  /** If true, pins the calendar to the viewer's current month and hides navigation. */
  staticCurrentMonth?: boolean;
};

export function StreakCalendar({
  streakHistory,
  currentStreak,
  longestStreak,
  staticCurrentMonth = false,
}: StreakCalendarProps) {
  const [month, setMonth] = useState<Date | null>(staticCurrentMonth ? null : new Date());

  useEffect(() => {
    if (!staticCurrentMonth) return;
    setMonth(new Date());
  }, [staticCurrentMonth]);

  const today = month ?? new Date();

  const loggedDates = useMemo(() => {
    const logDates = getLogDatesByDay(streakHistory, today, 42);
    return Object.entries(logDates)
      .filter(([, v]) => v)
      .map(([key]) => parseISO(key));
  }, [streakHistory]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          Current streak: <strong className="text-foreground">{currentStreak}</strong> day
          {currentStreak !== 1 ? "s" : ""}
        </span>
        <span className="text-muted-foreground">
          Longest: <strong className="text-foreground">{longestStreak}</strong> day
          {longestStreak !== 1 ? "s" : ""}
        </span>
      </div>
      {staticCurrentMonth && month === null ? (
        <div className="h-[244px] w-full border border-border bg-card/30" />
      ) : (
        <Calendar
          mode="single"
          selected={today}
          disabled
          month={staticCurrentMonth ? (month ?? undefined) : undefined}
          hideNavigation={staticCurrentMonth}
          className="border border-border p-2 w-full"
          modifiers={{ logged: loggedDates }}
          modifiersClassNames={{
            logged: "bg-primary text-primary-foreground",
          }}
        />
      )}
    </div>
  );
}
