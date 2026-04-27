"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { UserData } from "@/lib/types";
import type { WeeklyDaySummary } from "@/lib/types";
import { format, subDays } from "date-fns";
import {
  aggregateLogsToRecord,
  orderedDrinkSegmentIds,
  labelForDrinkSegmentId,
  colorForUnknownSegment,
} from "@/lib/drink-aggregation";
import { DRINK_TYPES } from "@/constants/hydration";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

function fillForSegment(id: string): string {
  return DRINK_TYPES.find((t) => t.id === id)?.color ?? colorForUnknownSegment(id);
}

function legacyByDrink(summary: WeeklyDaySummary | undefined): Record<string, number> {
  if (!summary) return {};
  if (summary.by_drink && Object.keys(summary.by_drink).length > 0) return summary.by_drink;
  if (summary.water_consumed > 0) return { water: summary.water_consumed };
  return {};
}

function niceCeilMl(n: number): number {
  if (n <= 0) return 500;
  const step = n <= 2000 ? 250 : 500;
  return Math.ceil(n / step) * step;
}

type WeeklySummaryBarProps = {
  data: UserData | null;
  weeklyHistory: WeeklyDaySummary[];
};

type GoalTier = "low" | "mid" | "high";

function tierForPercent(percent: number): GoalTier {
  if (percent >= 100) return "high";
  if (percent >= 50) return "mid";
  return "low";
}

function tierColor(tier: GoalTier): string {
  if (tier === "high") return "oklch(0.55 0.15 155)";
  if (tier === "mid") return "oklch(0.809 0.105 251.813)";
  return "oklch(0.75 0.12 35)";
}

function buildStackedWeekRows(
  data: UserData | null,
  weeklyHistory: WeeklyDaySummary[],
  segmentIds: string[]
): Record<string, string | number>[] {
  const today = format(new Date(), "yyyy-MM-dd");
  const byDate = new Map(weeklyHistory.map((d) => [d.date, d]));

  return Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i);
    const dateStr = format(d, "yyyy-MM-dd");
    const isToday = dateStr === today;
    const dayLabel = DAY_LABELS[d.getDay() === 0 ? 6 : d.getDay() - 1];

    const goal = isToday && data ? data.daily_goal : (byDate.get(dateStr)?.daily_goal ?? 0);
    const row: Record<string, string | number> = {
      day: dayLabel,
      date: dateStr,
      goal,
    };

    const byDrink: Record<string, number> =
      isToday && data?.logs
        ? aggregateLogsToRecord(data.logs)
        : legacyByDrink(byDate.get(dateStr));

    for (const id of segmentIds) {
      row[id] = byDrink[id] ?? 0;
    }
    const total = segmentIds.reduce((s, id) => s + (Number(row[id]) || 0), 0);
    row.total = total;
    row.progress = goal > 0 ? Math.round((total / goal) * 100) : 0;
    return row;
  });
}

function buildWeekChartConfig(segmentIds: string[]): ChartConfig {
  return Object.fromEntries(
    segmentIds.map((id) => [
      id,
      { label: labelForDrinkSegmentId(id), color: fillForSegment(id) },
    ])
  ) satisfies ChartConfig;
}

export function WeeklySummaryBar({ data, weeklyHistory }: WeeklySummaryBarProps) {
  const drinkMaps: Array<Record<string, number>> = [];
  if (data?.logs?.length) drinkMaps.push(aggregateLogsToRecord(data.logs));
  for (const w of weeklyHistory) {
    drinkMaps.push(legacyByDrink(w));
  }
  const segmentIds = orderedDrinkSegmentIds(drinkMaps);
  const stackKeys = segmentIds.length > 0 ? segmentIds : ["water"];
  const chartData = buildStackedWeekRows(data, weeklyHistory, stackKeys);
  const config = buildWeekChartConfig(stackKeys);

  const maxStack = Math.max(
    ...chartData.map((row) => stackKeys.reduce((s, id) => s + (Number(row[id]) || 0), 0)),
    500
  );
  const yMax = niceCeilMl(maxStack);
  const progressRows = chartData.map((row) => {
    const progress = Number(row.progress) || 0;
    const tier = tierForPercent(progress);
    const date = String(row.date);
    return {
      day: String(row.day),
      dayFull: format(new Date(`${date}T00:00:00`), "EEE"),
      date,
      progress,
      tier,
      color: tierColor(tier),
    };
  });

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-2 flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-medium text-foreground">Weekly summary</span>
        <span className="text-xs text-muted-foreground">
          ml per day, stacked by drink type (today uses current logs)
        </span>
      </div>
      <ChartContainer config={config} className="h-[200px] w-full">
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis
            type="number"
            domain={[0, yMax]}
            tick={{ fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}`}
            width={36}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} cursor={{ fill: "hsl(var(--muted) / 0.35)" }} />
          {stackKeys.map((id) => (
            <Bar
              key={id}
              dataKey={id}
              stackId="liquids"
              fill={`var(--color-${id})`}
              name={labelForDrinkSegmentId(id)}
              maxBarSize={36}
              radius={[0, 0, 0, 0]}
              isAnimationActive={true}
            />
          ))}
        </BarChart>
      </ChartContainer>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-t border-border pt-3 text-xs">
        {stackKeys.map((id) => (
          <div key={id} className="flex items-center gap-1.5">
            <div
              className="h-2 w-2 shrink-0 rounded-[2px]"
              style={{ backgroundColor: fillForSegment(id) }}
            />
            <span className="text-muted-foreground">{labelForDrinkSegmentId(id)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <p className="text-[10px] text-muted-foreground">Goal reach by day</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          {progressRows.map((row) => (
            <div key={row.date} className="flex items-center gap-1.5 rounded-sm border border-border px-2 py-1">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: row.color }} />
              <span className="text-[11px] text-muted-foreground">{row.dayFull}</span>
              <span className="text-[11px] tabular-nums text-foreground">{row.progress}%</span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: tierColor("low") }} />
            <span className="text-muted-foreground">&lt; 50%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: tierColor("mid") }} />
            <span className="text-muted-foreground">50-99%</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-[2px]" style={{ backgroundColor: tierColor("high") }} />
            <span className="text-muted-foreground">100%+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
