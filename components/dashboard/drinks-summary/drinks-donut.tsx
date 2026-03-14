"use client";

import { PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import type { UserData } from "@/lib/types";
import { DRINK_TYPES } from "@/constants/hydration";
import { format } from "date-fns";

const chartConfig = {
  water: { label: "Water", color: "var(--chart-1)" },
  tea: { label: "Tea", color: "var(--chart-2)" },
  coffee: { label: "Coffee", color: "var(--chart-3)" },
  other: { label: "Other", color: "var(--chart-4)" },
} satisfies ChartConfig;

type DrinksDonutProps = {
  data: UserData | null;
};

function aggregateByDrinkType(data: UserData | null): { name: string; value: number; id: string }[] {
  if (!data?.logs?.length) {
    return DRINK_TYPES.map((t) => ({ name: t.label, value: 0, id: t.id }));
  }
  const map = new Map<string, number>();
  for (const log of data.logs) {
    const type = log.drinkType ?? "water";
    const key = type in chartConfig ? type : "other";
    const existing = map.get(key) ?? 0;
    map.set(key, existing + log.amount);
  }
  return DRINK_TYPES.map((t) => ({
    name: t.label,
    value: map.get(t.id) ?? 0,
    id: t.id,
  })).filter((d) => d.value > 0).length
    ? DRINK_TYPES.map((t) => ({ name: t.label, value: map.get(t.id) ?? 0, id: t.id }))
    : [{ name: "Water", value: 0, id: "water" }];
}

export function DrinksDonut({ data }: DrinksDonutProps) {
  const chartData = aggregateByDrinkType(data);
  const total = chartData.reduce((s, d) => s + d.value, 0);
  const maxSegment = chartData.reduce((a, b) => (a.value >= b.value ? a : b), chartData[0]);
  const percent = total > 0 && maxSegment ? Math.round((maxSegment.value / total) * 100) : 0;

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">
          Other drinks
        </span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(), "MMMM yyyy")}
        </span>
      </div>

      <div className="relative mx-auto h-[200px] w-full max-w-[200px]">
        <ChartContainer config={chartConfig} className="h-full w-full aspect-square">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="55%"
              outerRadius="85%"
              paddingAngle={1}
              strokeWidth={0}
            >
              {chartData.map((entry) => {
                const color = DRINK_TYPES.find((t) => t.id === entry.id)?.color ?? "var(--chart-4)";
                return <Cell key={entry.id} fill={color} />;
              })}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} ml`, ""]}
              contentStyle={{ fontSize: 12 }}
            />
          </PieChart>
        </ChartContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold tabular-nums text-foreground">
            {total}
          </span>
          <span className="text-xs text-muted-foreground">ml total</span>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
        {chartData.filter((d) => d.value > 0).map((d) => {
          const color = DRINK_TYPES.find((t) => t.id === d.id)?.color ?? "var(--chart-4)";
          return (
            <div key={d.id} className="flex items-center gap-1.5">
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
          );
        })}
      </div>

      {maxSegment && total > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{maxSegment.name}</span>
            <span className="tabular-nums text-foreground">{percent}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${percent}%`,
                backgroundColor:
                  DRINK_TYPES.find((t) => t.id === maxSegment.id)?.color ?? "var(--chart-4)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
