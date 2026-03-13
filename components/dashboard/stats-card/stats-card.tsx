"use client";

import { TypographyLarge, TypographyMuted } from "@/components/ui/typography";

type StatsCardProps = {
  waterConsumed: number;
  dailyGoal: number;
  numTimesConsumed: number;
};

export function StatsCard({
  waterConsumed,
  dailyGoal,
  numTimesConsumed,
}: StatsCardProps) {
  const remaining = Math.max(0, dailyGoal - waterConsumed);

  return (
    <div className="border border-border bg-card p-4">
      <TypographyLarge className="tabular-nums">
        {waterConsumed} ml / {dailyGoal} ml
      </TypographyLarge>
      <TypographyMuted className="mt-1">
        {remaining} ml remaining · {numTimesConsumed} log
        {numTimesConsumed !== 1 ? "s" : ""} today
      </TypographyMuted>
    </div>
  );
}
