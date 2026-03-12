export const STORAGE_KEY = "hydroloop_user_data";
export const STREAK_HISTORY_KEY = "hydroloop_streak_history";
export const WEEKLY_HISTORY_KEY = "hydroloop_weekly_history";
export const WEEKLY_HISTORY_DAYS = 7;

/** Blue-shade palette for charts (like Browser Share reference: one hue, varying lightness) */
const DRINK_CHART_COLORS = {
  water: "oklch(0.85 0.08 252)",
  tea: "oklch(0.72 0.12 255)",
  coffee: "oklch(0.58 0.18 258)",
  other: "oklch(0.45 0.2 262)",
} as const;

export const DRINK_TYPES = [
  { id: "water", label: "Water", defaultAmount: 250, color: "var(--chart-1)", chartColor: DRINK_CHART_COLORS.water },
  { id: "tea", label: "Tea", defaultAmount: 200, color: "var(--chart-2)", chartColor: DRINK_CHART_COLORS.tea },
  { id: "coffee", label: "Coffee", defaultAmount: 180, color: "var(--chart-3)", chartColor: DRINK_CHART_COLORS.coffee },
  { id: "other", label: "Other", defaultAmount: 150, color: "var(--chart-4)", chartColor: DRINK_CHART_COLORS.other },
] as const;

export const DEFAULT_DAILY_GOAL = 2500;
export const MIN_DAILY_GOAL = 500;
export const MAX_DAILY_GOAL = 5000;
export const GOAL_STEP = 250;

export const QUICK_ADD_AMOUNTS = [100, 250, 500, 1000, 1500, 2000] as const;

export const DEFAULT_TIME_SPAN = { start: "09:00", end: "19:00" } as const;
export const DEFAULT_REMINDER_INTERVAL = 45;

export const CHART_TYPES = [
  { id: "radial", label: "Stacked radial" },
  { id: "bar", label: "Bar" },
  { id: "line", label: "Line" },
  { id: "area", label: "Area" },
  { id: "radar", label: "Radar" },
] as const;

/** Palettes: [water, tea, coffee, other] in oklch */
export const COLOR_PALETTES: Record<
  string,
  { water: string; tea: string; coffee: string; other: string }
> = {
  blue: {
    water: "oklch(0.85 0.08 252)",
    tea: "oklch(0.72 0.12 255)",
    coffee: "oklch(0.58 0.18 258)",
    other: "oklch(0.45 0.2 262)",
  },
  green: {
    water: "oklch(0.82 0.1 155)",
    tea: "oklch(0.65 0.14 158)",
    coffee: "oklch(0.5 0.16 75)",
    other: "oklch(0.4 0.12 165)",
  },
  warm: {
    water: "oklch(0.8 0.1 85)",
    tea: "oklch(0.65 0.15 55)",
    coffee: "oklch(0.5 0.18 35)",
    other: "oklch(0.45 0.14 25)",
  },
  cool: {
    water: "oklch(0.82 0.08 220)",
    tea: "oklch(0.62 0.12 240)",
    coffee: "oklch(0.5 0.15 260)",
    other: "oklch(0.4 0.14 280)",
  },
  violet: {
    water: "oklch(0.78 0.12 300)",
    tea: "oklch(0.6 0.18 290)",
    coffee: "oklch(0.5 0.2 280)",
    other: "oklch(0.4 0.16 270)",
  },
};

export const DEFAULT_CHART_TYPE = "radial";
export const DEFAULT_COLOR_PALETTE = "blue";
