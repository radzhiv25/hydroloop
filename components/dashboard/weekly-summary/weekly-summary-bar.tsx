"use client";

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { UserData } from "@/lib/types";
import type { WeeklyDaySummary } from "@/lib/types";
import { format, subDays } from "date-fns";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

const chartConfig = {
  progress: { label: "Progress", color: "var(--chart-1)" },
  low: { label: "Low", color: "oklch(0.75 0.12 35)" },
  mid: { label: "Mid", color: "var(--chart-1)" },
  high: { label: "High", color: "oklch(0.55 0.15 155)" },
} satisfies ChartConfig;

function barColorByProgress(value: number): string {
  if (value >= 100) return "oklch(0.55 0.15 155)";
  if (value >= 50) return "oklch(0.809 0.105 251.813)";
  return "oklch(0.75 0.12 35)";
}

type WeeklySummaryBarProps = {
  data: UserData | null;
  weeklyHistory: WeeklyDaySummary[];
};

function buildWeekData(
  data: UserData | null,
  weeklyHistory: WeeklyDaySummary[]
): { day: string; value: number; date: string }[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const byDate = new Map(weeklyHistory.map((d) => [d.date, d]));
  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isToday = dateStr === today;
    const consumed = isToday && data
      ? data.water_consumed
      : byDate.get(dateStr)?.water_consumed ?? 0;
    const goal = isToday && data
      ? data.daily_goal
      : byDate.get(dateStr)?.daily_goal ?? 1;
    const value = goal > 0 ? Math.min(100, (consumed / goal) * 100) : 0;
    return {
      day: DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      value: Math.round(value),
      date: dateStr,
    };
  });
}

export function WeeklySummaryBar({ data, weeklyHistory }: WeeklySummaryBarProps) {
  const chartData = buildWeekData(data, weeklyHistory);

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Weekly summary
        </span>
        <span className="text-xs text-muted-foreground">
          Progress toward daily goal by day
        </span>
      </div>
      <div className="h-[180px] w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 8, right: 8, left: 8, bottom: 0 }}
            >
              <XAxis
                dataKey="day"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis type="number" domain={[0, 100]} hide />
              <Bar
                dataKey="value"
                radius={[4, 4, 0, 0]}
                maxBarSize={32}
                isAnimationActive={true}
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={barColorByProgress(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      {/* Legend: what each bar color represents (progress toward goal) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-border pt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "oklch(0.75 0.12 35)" }}
          />
          <span className="text-muted-foreground">&lt; 50% goal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "oklch(0.809 0.105 251.813)" }}
          />
          <span className="text-muted-foreground">50–99%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div
            className="h-2 w-2 shrink-0 rounded-[2px]"
            style={{ backgroundColor: "oklch(0.55 0.15 155)" }}
          />
          <span className="text-muted-foreground">Goal met (100%)</span>
        </div>
      </div>
    </div>
  );
}
