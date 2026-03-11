"use client";

import { List } from "lucide-react";
import { GoalSelector } from "@/components/hydration-controls/goal-selector";
import { QuickAddWater } from "@/components/hydration-controls/quick-add-water";
import { HydrationChart } from "@/components/hydration-chart/hydration-chart";
import { StatsCard } from "@/components/stats-card/stats-card";
import { StreakCalendar } from "@/components/streak-calendar/streak-calendar";
import { WeeklySummaryBar } from "@/components/weekly-summary";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserData } from "@/lib/types";
import type { WeeklyDaySummary } from "@/lib/types";
import { motion } from "motion/react";

type HydrationDashboardProps = {
  data: UserData;
  addWater: (amount: number, time?: string, drinkType?: string) => void;
  setDailyGoal: (goal: number) => void;
  onOpenLogsDrawer?: () => void;
  streakHistory: Record<string, boolean>;
  weeklyHistory: WeeklyDaySummary[];
  currentStreak: number;
  longestStreak: number;
  isRefreshing?: boolean;
};

export function HydrationDashboard({
  data,
  addWater,
  setDailyGoal,
  onOpenLogsDrawer,
  streakHistory,
  weeklyHistory,
  currentStreak,
  longestStreak,
  isRefreshing = false,
}: HydrationDashboardProps) {
  if (isRefreshing) {
    return (
      <motion.div
        className="flex flex-1 flex-col gap-6 p-4"
        initial={{ opacity: 0.6 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <section>
          <Skeleton className="mb-2 h-3 w-24" />
          <div className="flex items-center justify-center gap-2">
            <Skeleton className="h-8 w-8 shrink-0" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 shrink-0" />
          </div>
          <Skeleton className="mt-2 h-2 w-full max-w-[200px] mx-auto" />
        </section>

        <section className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="min-w-0 flex-1">
            <div className="border border-border bg-card p-4">
              <Skeleton className="mb-2 h-3 w-20" />
              <Skeleton className="mx-auto h-[260px] w-full max-w-[260px]" />
              <Skeleton className="mt-2 h-3 w-32 mx-auto" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          </div>
          <div className="flex flex-col gap-2 md:min-w-[300px] md:shrink-0">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-[220px] w-full" />
          </div>
        </section>

        <section>
          <Skeleton className="mb-2 h-3 w-28" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-9 w-16" />
            ))}
          </div>
        </section>

        <section>
          <Skeleton className="mb-2 h-3 w-24" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="mt-2 h-3 w-20" />
        </section>

        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            {onOpenLogsDrawer && <Skeleton className="h-7 w-24" />}
          </div>
          <div className="border border-border bg-card p-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-full max-w-[280px]" />
          </div>
        </section>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="flex flex-1 flex-col gap-6 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <section>
        <GoalSelector
          dailyGoal={data.daily_goal}
          waterConsumed={data.water_consumed}
          onGoalChange={setDailyGoal}
        />
      </section>

      <section className="flex flex-col gap-6 md:flex-row md:items-start">
        <div className="min-w-0 flex-1">
          <HydrationChart
            data={data}
            waterConsumed={data.water_consumed}
            dailyGoal={data.daily_goal}
            chartType={data.chart_type}
            colorPalette={data.color_palette}
          />
        </div>
        <div className="flex flex-col gap-2 md:min-w-[300px] md:shrink-0">
          <p className="text-xs font-medium text-muted-foreground">
            Streak
          </p>
          <StreakCalendar
            streakHistory={streakHistory}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
          />
        </div>
      </section>

      <section>
        <QuickAddWater onAdd={addWater} />
      </section>

      <section>
        <WeeklySummaryBar data={data} weeklyHistory={weeklyHistory} />
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Today&apos;s summary
          </span>
          {onOpenLogsDrawer && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={onOpenLogsDrawer}
            >
              <List className="h-3.5 w-3.5" />
              Logs &amp; goal
            </Button>
          )}
        </div>
        <StatsCard
          waterConsumed={data.water_consumed}
          dailyGoal={data.daily_goal}
          numTimesConsumed={data.num_times_consumed}
        />
      </section>
    </motion.div>
  );
}
