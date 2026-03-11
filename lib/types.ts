export type WaterLogEntry = {
  time: string; // "HH:mm"
  amount: number; // ml
  /** drink type id: water, tea, coffee, other, or custom name */
  drinkType?: string;
};

export type WeeklyDaySummary = {
  date: string; // YYYY-MM-DD
  water_consumed: number;
  daily_goal: number;
};

export type TimeSpan = {
  start: string; // "HH:mm"
  end: string;
};

export type ChartType = "line" | "bar" | "area" | "radar" | "radial";
export type ColorPaletteId = "blue" | "green" | "warm" | "cool" | "violet";

export type UserData = {
  name: string;
  profileImage: string;
  reminder_interval: number; // minutes
  time_span: TimeSpan;
  daily_goal: number; // ml
  water_consumed: number;
  num_times_consumed: number;
  logs: WaterLogEntry[];
  /** ISO date of the day this data applies to (YYYY-MM-DD) */
  date: string;
  /** Hydration chart display type */
  chart_type?: ChartType;
  /** Color palette for charts */
  color_palette?: ColorPaletteId;
};
