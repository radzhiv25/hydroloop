"use client";

import { useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { getLogDatesByDay } from "@/lib/hydration";

type StreakCalendarProps = {
  streakHistory: Record<string, boolean>;
  currentStreak: number;
  longestStreak: number;
};

export function StreakCalendar({
  streakHistory,
  currentStreak,
  longestStreak,
}: StreakCalendarProps) {
  const today = new Date();

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
      <Calendar
        mode="single"
        selected={today}
        disabled
        className="border border-border p-2"
        modifiers={{ logged: loggedDates }}
        modifiersClassNames={{
          logged: "bg-primary text-primary-foreground",
        }}
      />
    </div>
  );
}
