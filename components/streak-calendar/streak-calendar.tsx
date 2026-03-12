"use client";

import { useEffect, useMemo, useState } from "react";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { format, parseISO } from "date-fns";
import { GlassWater } from "lucide-react";
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

  const { loggedDates, unloggedDates } = useMemo(() => {
    const logDates = getLogDatesByDay(streakHistory, today, 42);
    const logged = Object.entries(logDates)
      .filter(([, v]) => v)
      .map(([key]) => parseISO(key));
    const unlogged = Object.entries(logDates)
      .filter(([, v]) => !v)
      .map(([key]) => parseISO(key));
    return { loggedDates: logged, unloggedDates: unlogged };
  }, [streakHistory, today]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center text-xs">
        <span className="flex items-center gap-2 text-muted-foreground">
          <GlassWater className="h-4 w-4 shrink-0 text-sky-400 dark:text-sky-400" aria-hidden />
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
          modifiers={{ logged: loggedDates, unlogged: unloggedDates }}
          modifiersClassNames={{
            logged:
              "bg-sky-500/25 text-sky-900 dark:text-sky-100 backdrop-blur-md border border-sky-400/50 dark:border-sky-500/50 shadow-sm",
            unlogged:
              "bg-red-500/20 text-red-900 dark:text-red-100 backdrop-blur-sm border border-red-400/50 dark:border-red-500/50",
          }}
          components={{
            DayButton: (props) => (
              <CalendarDayButton {...props}>
                {props.modifiers?.logged ? (
                  <GlassWater
                    className="size-5 text-sky-800 dark:text-sky-100"
                    aria-hidden
                  />
                ) : (
                  props.children
                )}
              </CalendarDayButton>
            ),
          }}
        />
      )}
    </div>
  );
}
