"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  RadialBarChart,
  RadialBar,
  Label,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { format } from "date-fns";
import type { UserData } from "@/lib/types";
import type { ChartType } from "@/lib/types";
import {
  DRINK_TYPES,
  COLOR_PALETTES,
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
} from "@/constants/hydration";
import {
  aggregateLogsToSegments,
  colorForUnknownSegment,
  type DrinkSegment,
} from "@/lib/drink-aggregation";

function getPaletteColors(paletteId: string | undefined) {
  const id = paletteId && paletteId in COLOR_PALETTES ? paletteId : DEFAULT_COLOR_PALETTE;
  return COLOR_PALETTES[id] ?? COLOR_PALETTES.blue;
}

function buildChartConfig(segments: DrinkSegment[], colors: Record<string, string>) {
  return Object.fromEntries(
    segments.map((s) => [
      s.id,
      {
        label: s.name,
        color: colors[s.id] ?? colorForUnknownSegment(s.id),
      },
    ])
  ) as ChartConfig;
}

type HydrationChartProps = {
  data: UserData | null;
  waterConsumed: number;
  dailyGoal: number;
  chartType?: ChartType;
  colorPalette?: string;
};

export function HydrationChart({
  data,
  waterConsumed,
  dailyGoal,
  chartType = DEFAULT_CHART_TYPE,
  colorPalette = DEFAULT_COLOR_PALETTE,
}: HydrationChartProps) {
  const drinkData = data?.logs?.length
    ? aggregateLogsToSegments(data.logs)
    : (DRINK_TYPES.map((t) => ({ id: t.id, name: t.label, value: 0 })) satisfies DrinkSegment[]);
  const totalDrinks = drinkData.reduce((s, d) => s + d.value, 0);
  const maxSegment =
    drinkData.length > 0
      ? drinkData.reduce((a, b) => (a.value >= b.value ? a : b), drinkData[0])
      : null;
  const shareOfIntake =
    totalDrinks > 0 && maxSegment
      ? Math.round((maxSegment.value / totalDrinks) * 100)
      : 0;
  const percentTowardGoal =
    dailyGoal > 0 ? Math.min(100, Math.round((waterConsumed / dailyGoal) * 100)) : 0;

  const baseColors = getPaletteColors(colorPalette);
  const colors = data?.custom_chart_colors
    ? { ...baseColors, ...data.custom_chart_colors }
    : baseColors;
  const getColor = (id: string) =>
    (colors as Record<string, string>)[id] ??
    baseColors[id as keyof typeof baseColors] ??
    colorForUnknownSegment(id);

  const chartData =
    totalDrinks > 0
      ? drinkData.filter((d) => d.value > 0).map((d) => ({ ...d, fill: getColor(d.id) }))
      : [{ id: "water", name: "Water", value: 1, fill: colors.water }];

  const barLineAreaData = drinkData.map((d) => ({ ...d, fill: getColor(d.id) }));
  const maxVal = Math.max(1, ...drinkData.map((d) => d.value));
  const radarData = drinkData.map((d) => ({ subject: d.name, value: d.value, fullMark: maxVal, id: d.id }));

  const config = buildChartConfig(drinkData, Object.fromEntries(drinkData.map((d) => [d.id, getColor(d.id)])));

  const renderChart = () => {
    const chartHeight = 260;
    const commonChartProps = { width: "100%", height: "100%" };

    switch (chartType) {
      case "radial": {
        const stackedRow = drinkData.reduce(
          (acc, d) => {
            acc[d.id] = d.value;
            return acc;
          },
          {} as Record<string, number>
        );
        if (Object.values(stackedRow).every((v) => v === 0)) {
          stackedRow.water = 1;
        }
        const radialStackedData = [stackedRow];
        return (
          <ChartContainer config={config} className="h-full w-full aspect-square">
            <RadialBarChart
              data={radialStackedData}
              startAngle={90}
              endAngle={-270}
              innerRadius="54%"
              outerRadius="88%"
            >
              <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      const cx = viewBox.cx ?? 0;
                      const cy = viewBox.cy ?? 0;
                      return (
                        <text x={cx} y={cy} textAnchor="middle" className="fill-foreground">
                          <tspan
                            x={cx}
                            y={cy-2}
                            fill="currentColor"
                            fontSize={28}
                            fontWeight="bold"
                          >
                            {waterConsumed}
                          </tspan>
                          <tspan
                            x={cx}
                            y={cy+12}
                            className="fill-muted-foreground"
                            fontSize={13}
                          >
                            ml consumed
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </PolarRadiusAxis>
              {drinkData.map((d) => (
                <RadialBar
                  key={d.id}
                  dataKey={d.id}
                  stackId="a"
                  cornerRadius={5}
                  fill={`var(--color-${d.id})`}
                  className="stroke-transparent stroke-2"
                />
              ))}
            </RadialBarChart>
          </ChartContainer>
        );
      }

      case "bar": {
        return (
          <ResponsiveContainer {...commonChartProps}>
            <BarChart data={barLineAreaData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="ml">
                {barLineAreaData.map((entry) => (
                  <Cell key={entry.id} fill={getColor(entry.id)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case "line": {
        return (
          <ResponsiveContainer {...commonChartProps}>
            <LineChart data={barLineAreaData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="value" strokeWidth={2} name="ml" dot={{ r: 4 }}>
                {barLineAreaData.map((entry, i) => (
                  <Cell key={entry.id} stroke={getColor(entry.id)} />
                ))}
              </Line>
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case "area": {
        return (
          <ResponsiveContainer {...commonChartProps}>
            <AreaChart data={barLineAreaData} margin={{ top: 8, right: 8, left: 8, bottom: 24 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={colors.water}
                fill={colors.water}
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      }

      case "radar": {
        return (
          <ResponsiveContainer {...commonChartProps}>
            <RadarChart data={radarData} margin={{ top: 16, right: 16, left: 16, bottom: 16 }}>
              <PolarGrid />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis tick={{ fontSize: 10 }} />
              <Radar name="ml" dataKey="value" stroke={colors.water} fill={colors.water} fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        );
      }

      default:
        return (
          <ResponsiveContainer {...commonChartProps}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="38%"
                outerRadius="92%"
                paddingAngle={2}
                strokeWidth={0}
              >
                {chartData.map((entry) => (
                  <Cell key={entry.id} fill={getColor(entry.id)} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">Hydration</span>
        <span className="text-xs text-muted-foreground">
          {format(new Date(), "MMMM yyyy")}
        </span>
      </div>

      <div className="relative mx-auto h-[260px] w-full max-w-[260px]">
        <ChartContainer config={config} className="h-full w-full aspect-square">
          {renderChart()}
        </ChartContainer>
      </div>

      <p className="mt-2 text-center text-[10px] text-muted-foreground">
        What each color is
      </p>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs">
        {drinkData.filter((d) => d.value > 0).map((d) => (
          <div key={d.id} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
              style={{ backgroundColor: getColor(d.id) }}
            />
            <span className="text-muted-foreground">{d.name}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Toward daily goal</span>
          <span className="tabular-nums text-foreground">{percentTowardGoal}%</span>
        </div>
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${percentTowardGoal}%`,
              backgroundColor:
                maxSegment && totalDrinks > 0 ? getColor(maxSegment.id) : colors.water,
            }}
          />
        </div>
        {maxSegment && totalDrinks > 0 && (
          <p className="mt-1 text-[10px] text-muted-foreground">
            Largest: {maxSegment.name} ({shareOfIntake}% of intake)
          </p>
        )}
      </div>

      <p className="mt-3 text-xs text-muted-foreground">
        Toward daily goal of {dailyGoal} ml
      </p>
    </div>
  );
}
