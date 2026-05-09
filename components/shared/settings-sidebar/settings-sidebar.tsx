"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserData, ColorPaletteId } from "@/lib/types";
import { clearAllData, getDetailedLogHistory, getUserData } from "@/lib/storage";
import {
  MIN_DAILY_GOAL,
  MAX_DAILY_GOAL,
  DAILY_GOAL_PRESETS,
  DEFAULT_REMINDER_INTERVAL,
  DEFAULT_REMINDER_DAYS,
  REMINDER_WEEKDAY_TOGGLES,
  REMINDER_SOUNDS,
  REMINDER_SOUND_CUSTOM,
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_DURATION,
  MIN_REMINDER_SOUND_DURATION,
  MAX_REMINDER_SOUND_DURATION,
  CHART_TYPES,
  COLOR_PALETTES,
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
  DRINK_TYPES,
} from "@/constants/hydration";
import { MEASURED_BOTTLE_TIP } from "@/constants";
import { normalizeReminderDays } from "@/lib/reminder-weekdays";
import { uploadSoundToCloudinary } from "@/lib/cloudinary";
import { playReminderSoundForDuration } from "@/hooks/useReminder";
import { Trash2, Palette, Volume2, X, Upload, Loader2 } from "lucide-react";
import { ColorPicker } from "@/components/ui/color-picker";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

const schema = z.object({
  name: z.string(),
  profileImage: z.string(),
  reminder_interval: z.number().min(5).max(120),
  reminder_sound: z.string(),
  custom_sound_url: z.string().optional(),
  reminder_sound_duration_seconds: z.number().min(MIN_REMINDER_SOUND_DURATION).max(MAX_REMINDER_SOUND_DURATION),
  time_start: z.string(),
  time_end: z.string(),
  reminder_days: z.array(z.number().int().min(0).max(6)).min(1),
  daily_goal: z.number().min(MIN_DAILY_GOAL).max(MAX_DAILY_GOAL),
  chart_type: z.enum(["line", "bar", "area", "radar", "radial"]),
  color_palette: z.string(),
  custom_water: z.string().optional(),
  custom_tea: z.string().optional(),
  custom_coffee: z.string().optional(),
  custom_other: z.string().optional(),
  custom_drink_presets: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof schema>;

function isPresetGoal(goal: number | undefined): boolean {
  if (goal == null) return true;
  return (DAILY_GOAL_PRESETS as readonly number[]).includes(goal);
}

type SettingsSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserData | null;
  onSave: (updates: Partial<UserData>) => void;
  onLiveColorUpdate?: (updates: Partial<UserData>) => void;
  onLiveReminderUpdate?: (updates: Partial<UserData>) => void;
  onDataCleared?: () => void;
};

export function SettingsSidebar({
  open,
  onOpenChange,
  data,
  onSave,
  onLiveColorUpdate,
  onLiveReminderUpdate,
  onDataCleared,
}: SettingsSidebarProps) {
  const router = useRouter();
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>(
    {
      defaultValues: data
        ? {
            name: data.name,
            profileImage: data.profileImage,
            reminder_interval: data.reminder_interval,
            reminder_sound: data.reminder_sound ?? DEFAULT_REMINDER_SOUND,
            custom_sound_url: data.custom_sound_url ?? "",
            reminder_sound_duration_seconds: data.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
            time_start: data.time_span.start,
            time_end: data.time_span.end,
            reminder_days: normalizeReminderDays(data.reminder_days),
            daily_goal: data.daily_goal,
            chart_type: data.chart_type ?? DEFAULT_CHART_TYPE,
            color_palette: data.color_palette ?? DEFAULT_COLOR_PALETTE,
            custom_water: data.custom_chart_colors?.water ?? "",
            custom_tea: data.custom_chart_colors?.tea ?? "",
            custom_coffee: data.custom_chart_colors?.coffee ?? "",
            custom_other: data.custom_chart_colors?.other ?? "",
            custom_drink_presets: data.custom_drink_presets ?? [],
          }
        : undefined,
    }
  );

  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [soundUploading, setSoundUploading] = useState(false);
  const [soundUploadError, setSoundUploadError] = useState<string | null>(null);
  const [showCustomGoal, setShowCustomGoal] = useState(false);
  const [newCustomDrink, setNewCustomDrink] = useState("");
  const [hasMigratableData, setHasMigratableData] = useState(false);
  const [isCheckingMigration, setIsCheckingMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationProgress, setMigrationProgress] = useState(0);
  const [migrationDone, setMigrationDone] = useState(false);
  const previewStopRef = useRef<(() => void) | null>(null);
  const skipSoundOnNextChangeRef = useRef(false);
  const reminderInterval = watch("reminder_interval");
  const reminderSoundDuration = watch("reminder_sound_duration_seconds") ?? DEFAULT_REMINDER_SOUND_DURATION;
  const dailyGoal = watch("daily_goal");

  const stopPreview = useCallback(() => {
    previewStopRef.current?.();
    previewStopRef.current = null;
  }, []);

  const playPreview = useCallback(() => {
    stopPreview();
    const sound = watch("reminder_sound") ?? DEFAULT_REMINDER_SOUND;
    const customUrl = sound === REMINDER_SOUND_CUSTOM ? watch("custom_sound_url") : undefined;
    const duration = watch("reminder_sound_duration_seconds") ?? DEFAULT_REMINDER_SOUND_DURATION;
    previewStopRef.current = playReminderSoundForDuration(sound, duration, customUrl);
  }, [stopPreview, watch]);
  const colorPaletteId = watch("color_palette") ?? DEFAULT_COLOR_PALETTE;
  const palette = COLOR_PALETTES[colorPaletteId] ?? COLOR_PALETTES.blue;
  const customWater = watch("custom_water");
  const customTea = watch("custom_tea");
  const customCoffee = watch("custom_coffee");
  const customOther = watch("custom_other");
  const customDrinkPresets = watch("custom_drink_presets") ?? [];
  const effectiveColors = {
    water: customWater?.trim() || palette.water,
    tea: customTea?.trim() || palette.tea,
    coffee: customCoffee?.trim() || palette.coffee,
    other: customOther?.trim() || palette.other,
  };

  const saveColorUpdates = onLiveColorUpdate ?? onSave;
  const applyColorLive = useCallback(
    (overrides?: { color_palette?: string; custom_water?: string; custom_tea?: string; custom_coffee?: string; custom_other?: string }) => {
      const pal = overrides?.color_palette ?? watch("color_palette") ?? DEFAULT_COLOR_PALETTE;
      const w = overrides?.custom_water ?? watch("custom_water")?.trim();
      const t = overrides?.custom_tea ?? watch("custom_tea")?.trim();
      const c = overrides?.custom_coffee ?? watch("custom_coffee")?.trim();
      const o = overrides?.custom_other ?? watch("custom_other")?.trim();
      const custom_chart_colors =
        w || t || c || o
          ? { water: w || undefined, tea: t || undefined, coffee: c || undefined, other: o || undefined }
          : undefined;
      saveColorUpdates({
        color_palette: (Object.keys(COLOR_PALETTES).includes(pal) ? pal : DEFAULT_COLOR_PALETTE) as ColorPaletteId,
        custom_chart_colors,
      });
    },
    [watch, saveColorUpdates]
  );

  useEffect(() => {
    if (!open) stopPreview();
  }, [open, stopPreview]);

  useEffect(() => {
    setShowCustomGoal(!isPresetGoal(dailyGoal));
  }, [dailyGoal]);

  useEffect(() => {
    if (open && data) {
      skipSoundOnNextChangeRef.current = true;
      setShowCustomGoal(!isPresetGoal(data.daily_goal));
      reset({
        name: data.name,
        profileImage: data.profileImage,
        reminder_interval: data.reminder_interval,
        reminder_sound: data.reminder_sound ?? DEFAULT_REMINDER_SOUND,
        custom_sound_url: data.custom_sound_url ?? "",
        reminder_sound_duration_seconds: data.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
        time_start: data.time_span.start,
        time_end: data.time_span.end,
        reminder_days: normalizeReminderDays(data.reminder_days),
        daily_goal: data.daily_goal,
        chart_type: data.chart_type ?? DEFAULT_CHART_TYPE,
        color_palette: data.color_palette ?? DEFAULT_COLOR_PALETTE,
        custom_water: data.custom_chart_colors?.water ?? "",
        custom_tea: data.custom_chart_colors?.tea ?? "",
        custom_coffee: data.custom_chart_colors?.coffee ?? "",
        custom_other: data.custom_chart_colors?.other ?? "",
        custom_drink_presets: data.custom_drink_presets ?? [],
      });
      const t = setTimeout(() => {
        skipSoundOnNextChangeRef.current = false;
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open, data, reset]);

  useEffect(() => {
    if (!open) return;
    let mounted = true;
    void (async () => {
      setIsCheckingMigration(true);
      try {
        const [current, detailed] = await Promise.all([getUserData(), getDetailedLogHistory()]);
        if (!mounted) return;
        const hasCurrent =
          !!current &&
          (current.logs.length > 0 ||
            current.water_consumed > 0 ||
            current.num_times_consumed > 0 ||
            Boolean(current.name?.trim()) ||
            Boolean(current.profileImage?.trim()));
        const hasDetailed = Object.values(detailed).some((logs) => logs.length > 0);
        setHasMigratableData(hasCurrent || hasDetailed);
      } finally {
        if (mounted) setIsCheckingMigration(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [open]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message || "Failed to logout");
      return;
    }
    toast.success("Logged out");
    onOpenChange(false);
    router.replace("/auth");
  };

  const handleMigrateToCloud = async () => {
    if (isMigrating) return;
    setIsMigrating(true);
    setMigrationDone(false);
    setMigrationProgress(5);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Please login again before migration.");
      }

      setMigrationProgress(15);
      const [current, detailed] = await Promise.all([getUserData(), getDetailedLogHistory()]);

      setMigrationProgress(35);
      if (current) {
        const settingsPayload = {
          user_id: user.id,
          reminder_interval_mins: current.reminder_interval,
          reminder_days: current.reminder_days ?? DEFAULT_REMINDER_DAYS,
          time_span_start: `${current.time_span.start}:00`,
          time_span_end: `${current.time_span.end}:00`,
          daily_goal_ml: current.daily_goal,
          chart_type: current.chart_type ?? DEFAULT_CHART_TYPE,
          color_palette: current.color_palette ?? DEFAULT_COLOR_PALETTE,
          custom_chart_colors: current.custom_chart_colors ?? {},
          custom_drink_presets: current.custom_drink_presets ?? [],
        };
        const { error: settingsError } = await supabase.from("user_settings").upsert(settingsPayload);
        if (settingsError) throw settingsError;
      }

      const logRows: Array<{
        user_id: string;
        happened_at: string;
        amount_ml: number;
        drink_type: string;
        source: "web";
        client_event_id: string;
      }> = [];

      const buildRowsForDate = (
        date: string,
        logs: Array<{ time: string; amount: number; drinkType?: string }>,
        sourceLabel: "history" | "today"
      ) => {
        logs.forEach((entry, index) => {
          const hhmm = entry.time?.slice(0, 5) || "12:00";
          const stamp = new Date(`${date}T${hhmm}:00`);
          const iso = Number.isNaN(stamp.getTime()) ? new Date(`${date}T12:00:00`).toISOString() : stamp.toISOString();
          logRows.push({
            user_id: user.id,
            happened_at: iso,
            amount_ml: entry.amount,
            drink_type: entry.drinkType?.trim() || "water",
            source: "web",
            client_event_id: `legacy:${sourceLabel}:${date}:${hhmm}:${entry.amount}:${entry.drinkType ?? "water"}:${index}`,
          });
        });
      };

      Object.entries(detailed).forEach(([date, logs]) => buildRowsForDate(date, logs, "history"));
      if (current?.logs?.length) {
        buildRowsForDate(current.date, current.logs, "today");
      }

      setMigrationProgress(55);
      if (logRows.length > 0) {
        const chunkSize = 200;
        for (let i = 0; i < logRows.length; i += chunkSize) {
          const chunk = logRows.slice(i, i + chunkSize);
          const { error: logsError } = await supabase
            .from("hydration_logs")
            .upsert(chunk, { onConflict: "user_id,client_event_id", ignoreDuplicates: true });
          if (logsError) throw logsError;
          const ratio = (i + chunk.length) / logRows.length;
          setMigrationProgress(Math.min(90, 55 + Math.floor(ratio * 35)));
        }

        const sortedDates = [...new Set(logRows.map((row) => row.happened_at.slice(0, 10)))].sort();
        if (sortedDates.length > 0) {
          const { error: recomputeError } = await supabase.rpc("recompute_hydration_daily", {
            p_user_id: user.id,
            p_from: sortedDates[0],
            p_to: sortedDates[sortedDates.length - 1],
          });
          if (recomputeError) throw recomputeError;
        }
      }

      setMigrationProgress(100);
      setMigrationDone(true);
      toast.success("Migration completed");
      setHasMigratableData(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Migration failed";
      toast.error(message);
    } finally {
      setIsMigrating(false);
    }
  };

  const onSubmit = (values: FormValues) => {
    const v = values;
    const custom_chart_colors = [
      v.custom_water?.trim(),
      v.custom_tea?.trim(),
      v.custom_coffee?.trim(),
      v.custom_other?.trim(),
    ].some(Boolean)
      ? {
          water: v.custom_water?.trim() || undefined,
          tea: v.custom_tea?.trim() || undefined,
          coffee: v.custom_coffee?.trim() || undefined,
          other: v.custom_other?.trim() || undefined,
        }
      : undefined;
    const validChartTypes = ["line", "bar", "area", "radar", "radial"] as const;
    const chartType = validChartTypes.includes(v.chart_type as typeof validChartTypes[number])
      ? v.chart_type
      : DEFAULT_CHART_TYPE;

    onSave({
      name: v.name,
      profileImage: v.profileImage,
      reminder_interval: v.reminder_interval,
      reminder_sound: v.reminder_sound || DEFAULT_REMINDER_SOUND,
      custom_sound_url: v.reminder_sound === REMINDER_SOUND_CUSTOM ? (v.custom_sound_url?.trim() || undefined) : undefined,
      reminder_sound_duration_seconds: v.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
      time_span: { start: v.time_start, end: v.time_end },
      reminder_days: normalizeReminderDays(v.reminder_days),
      daily_goal: v.daily_goal,
      chart_type: chartType,
      color_palette: (Object.keys(COLOR_PALETTES).includes(v.color_palette)
        ? v.color_palette
        : DEFAULT_COLOR_PALETTE) as ColorPaletteId,
      custom_chart_colors,
      custom_drink_presets: (v.custom_drink_presets ?? []).map((s) => s.trim()).filter(Boolean),
    });
    onOpenChange(false);
  };

  const addCustomDrinkPreset = () => {
    const next = newCustomDrink.trim();
    if (!next) return;
    const exists = customDrinkPresets.some((d) => d.trim().toLowerCase() === next.toLowerCase());
    if (exists) return;
    setValue("custom_drink_presets", [...customDrinkPresets, next], { shouldDirty: true });
    setNewCustomDrink("");
  };

  const removeCustomDrinkPreset = (name: string) => {
    setValue(
      "custom_drink_presets",
      customDrinkPresets.filter((d) => d !== name),
      { shouldDirty: true }
    );
  };

  if (!open) return null;

  return (
    <aside
      className="fixed right-0 top-0 z-50 flex h-screen w-[min(400px,100vw)] flex-col border-l border-border bg-card shadow-lg"
      aria-label="Settings"
    >
      <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-foreground">Settings</h2>
          <p className="truncate text-xs text-muted-foreground">
            Update your profile and reminder preferences.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => onOpenChange(false)}
          aria-label="Close settings"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <form
        id="settings-form"
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-4"
      >
          <div className="grid gap-2">
            <Label htmlFor="settings-name">Name</Label>
            <Input id="settings-name" {...register("name")} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-profileImage">Profile image URL</Label>
            <Input
              id="settings-profileImage"
              type="url"
              {...register("profileImage")}
            />
          </div>
          <div className="grid gap-2">
            <Label>Reminder days</Label>
            <p className="text-[10px] text-muted-foreground leading-snug">
              Reminders only on selected days, during the hours below.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {REMINDER_WEEKDAY_TOGGLES.map(({ value, label }) => {
                const days = watch("reminder_days") ?? [...DEFAULT_REMINDER_DAYS];
                const selected = days.includes(value);
                return (
                  <Button
                    key={value}
                    type="button"
                    size="sm"
                    variant={selected ? "default" : "outline"}
                    className="min-w-[2.75rem] rounded-none px-2 text-xs"
                    onClick={() => {
                      const cur = normalizeReminderDays(days);
                      if (cur.includes(value)) {
                        if (cur.length <= 1) return;
                        setValue(
                          "reminder_days",
                          cur.filter((d) => d !== value),
                          { shouldDirty: true }
                        );
                      } else {
                        setValue(
                          "reminder_days",
                          normalizeReminderDays([...cur, value]),
                          { shouldDirty: true }
                        );
                      }
                    }}
                  >
                    {label}
                  </Button>
                );
              })}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-time_start">Reminder window start</Label>
            <Input
              id="settings-time_start"
              type="time"
              {...register("time_start")}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-time_end">Reminder window end</Label>
            <Input
              id="settings-time_end"
              type="time"
              {...register("time_end")}
            />
          </div>
          <div className="grid gap-2">
            <Label>Reminder interval (minutes)</Label>
            <div className="flex items-center gap-2">
              <Slider
                min={5}
                max={120}
                step={5}
                value={[reminderInterval ?? DEFAULT_REMINDER_INTERVAL]}
                onValueChange={([v]) => setValue("reminder_interval", v)}
              />
              <span className="min-w-[2rem] text-xs tabular-nums">
                {reminderInterval ?? DEFAULT_REMINDER_INTERVAL}
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-reminder_sound">Reminder sound</Label>
            <div className="flex items-center gap-2">
              <Select
                value={watch("reminder_sound") ?? DEFAULT_REMINDER_SOUND}
                onValueChange={(v) => {
                  setValue("reminder_sound", v);
                  setSoundUploadError(null);
                  onLiveReminderUpdate?.({
                    reminder_sound: v,
                    custom_sound_url: v === REMINDER_SOUND_CUSTOM ? (watch("custom_sound_url")?.trim() || undefined) : undefined,
                  });
                  stopPreview();
                  if (skipSoundOnNextChangeRef.current) return;
                  const customUrl = v === REMINDER_SOUND_CUSTOM ? watch("custom_sound_url") : undefined;
                  const duration = watch("reminder_sound_duration_seconds") ?? DEFAULT_REMINDER_SOUND_DURATION;
                  previewStopRef.current = playReminderSoundForDuration(v, duration, customUrl);
                }}
              >
                <SelectTrigger id="settings-reminder_sound" className="flex-1 rounded-none">
                  <SelectValue placeholder="Hydroloop 1" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {REMINDER_SOUNDS.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="rounded-none">
                      {s.label}
                    </SelectItem>
                  ))}
                  <SelectItem value={REMINDER_SOUND_CUSTOM}>Custom (upload)</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={playPreview}
                aria-label="Preview reminder sound"
              >
                <Volume2 className="h-4 w-4" />
              </Button>
            </div>
            {(watch("reminder_sound") ?? DEFAULT_REMINDER_SOUND) === REMINDER_SOUND_CUSTOM && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="settings-custom-sound-upload" className="cursor-pointer">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/50 px-3 py-2 text-xs font-medium hover:bg-muted">
                      {soundUploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Upload className="h-3.5 w-3.5" />
                      )}
                      {soundUploading ? "Uploading…" : "Upload sound (MP3, WAV)"}
                    </span>
                  </Label>
                  <input
                    id="settings-custom-sound-upload"
                    type="file"
                    accept="audio/mpeg,audio/mp3,audio/wav,audio/x-wav,.mp3,.wav"
                    className="sr-only"
                    disabled={soundUploading}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      setSoundUploadError(null);
                      setSoundUploading(true);
                      const result = await uploadSoundToCloudinary(file);
                      setSoundUploading(false);
                      if (result.ok) {
                        setValue("custom_sound_url", result.url);
                        onLiveReminderUpdate?.({
                          reminder_sound: REMINDER_SOUND_CUSTOM,
                          custom_sound_url: result.url,
                        });
                        stopPreview();
                        const duration = watch("reminder_sound_duration_seconds") ?? DEFAULT_REMINDER_SOUND_DURATION;
                        previewStopRef.current = playReminderSoundForDuration(REMINDER_SOUND_CUSTOM, duration, result.url);
                      } else {
                        setSoundUploadError(result.error);
                      }
                    }}
                  />
                </div>
                {soundUploadError && (
                  <p className="text-xs text-destructive">{soundUploadError}</p>
                )}
                {watch("custom_sound_url")?.trim() && (
                  <p className="text-xs text-muted-foreground truncate" title={watch("custom_sound_url") ?? ""}>
                    Custom sound set
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Reminder sound duration (seconds)</Label>
            <div className="flex items-center gap-2">
              <Slider
                min={MIN_REMINDER_SOUND_DURATION}
                max={MAX_REMINDER_SOUND_DURATION}
                step={1}
                value={[reminderSoundDuration]}
                onValueChange={([v]) => {
                  setValue("reminder_sound_duration_seconds", v);
                  onLiveReminderUpdate?.({ reminder_sound_duration_seconds: v });
                }}
              />
              <span className="min-w-[2rem] text-xs tabular-nums">
                {reminderSoundDuration}s
              </span>
            </div>
          </div>
          <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
            <p className="text-xs leading-relaxed text-muted-foreground">{MEASURED_BOTTLE_TIP}</p>
          </div>
          <div className="grid gap-2">
            <Label>Daily goal (ml)</Label>
            <div className="flex flex-wrap gap-2">
              {DAILY_GOAL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={(dailyGoal ?? 2500) === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setValue("daily_goal", preset);
                    setShowCustomGoal(false);
                  }}
                >
                  {preset} ml
                </Button>
              ))}
              <Button
                type="button"
                variant={showCustomGoal ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setShowCustomGoal(true);
                  if (!dailyGoal) setValue("daily_goal", MIN_DAILY_GOAL);
                }}
              >
                Custom
              </Button>
            </div>
            {showCustomGoal && (
              <div className="flex items-center gap-2">
                <Slider
                  min={MIN_DAILY_GOAL}
                  max={MAX_DAILY_GOAL}
                  step={100}
                  value={[dailyGoal ?? MIN_DAILY_GOAL]}
                  onValueChange={([v]) => setValue("daily_goal", v)}
                />
                <span className="min-w-[3rem] text-xs tabular-nums">
                  {dailyGoal ?? MIN_DAILY_GOAL} ml
                </span>
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-chart_type">Graph type</Label>
            <Select
              value={watch("chart_type") ?? DEFAULT_CHART_TYPE}
              onValueChange={(v) => setValue("chart_type", v as FormValues["chart_type"])}
            >
              <SelectTrigger id="settings-chart_type" className="rounded-none">
                <SelectValue placeholder="Graph type" />
              </SelectTrigger>
              <SelectContent className="rounded-none">
                {CHART_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id} className="rounded-none">
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Quick add custom drinks</Label>
            <p className="text-[10px] text-muted-foreground">
              Add drinks you log often so they appear as quick-add tabs.
            </p>
            <div className="flex items-center gap-2">
              <Input
                value={newCustomDrink}
                onChange={(e) => setNewCustomDrink(e.target.value)}
                placeholder="e.g. Green Tea"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomDrinkPreset();
                  }
                }}
              />
              <Button type="button" variant="outline" onClick={addCustomDrinkPreset}>
                Add
              </Button>
            </div>
            {customDrinkPresets.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                {customDrinkPresets.map((name) => (
                  <Button
                    key={name}
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => removeCustomDrinkPreset(name)}
                  >
                    {name}
                    <X className="h-3 w-3" />
                  </Button>
                ))}
              </div>
            )}
          </div>
          <div className="grid gap-2">
            <Label>Chart colors</Label>
            <Button
              type="button"
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setColorDialogOpen(true)}
            >
              <Palette className="h-4 w-4" />
              Customize colors
            </Button>
            <div className="flex flex-wrap items-center gap-2">
              {DRINK_TYPES.map((t) => (
                <div key={t.id} className="flex items-center gap-1.5">
                  <div
                    className="h-5 w-5 shrink-0 rounded-none border border-border"
                    style={{ backgroundColor: effectiveColors[t.id as keyof typeof effectiveColors] }}
                  />
                  <span className="text-[10px] text-muted-foreground">{t.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Dialog open={colorDialogOpen} onOpenChange={setColorDialogOpen}>
            <DialogContent className="sm:max-w-sm" showCloseButton>
              <DialogHeader>
                <DialogTitle>Chart colors</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid gap-2">
                  <Label htmlFor="dialog-color_palette">Color palette</Label>
                  <Select
                    value={watch("color_palette") ?? DEFAULT_COLOR_PALETTE}
                    onValueChange={(v) => {
                      setValue("color_palette", v);
                      applyColorLive({ color_palette: v });
                    }}
                  >
                    <SelectTrigger id="dialog-color_palette" className="rounded-none">
                      <SelectValue placeholder="Color palette" />
                    </SelectTrigger>
                    <SelectContent className="rounded-none">
                      {Object.keys(COLOR_PALETTES).map((id) => (
                        <SelectItem key={id} value={id} className="rounded-none">
                          {id.charAt(0).toUpperCase() + id.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <div className="flex flex-wrap items-center gap-3 rounded-none border border-border bg-muted/30 p-3">
                    {DRINK_TYPES.map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 shrink-0 rounded-none border border-border"
                          style={{ backgroundColor: effectiveColors[t.id as keyof typeof effectiveColors] }}
                        />
                        <span className="text-xs text-muted-foreground">{t.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Custom colors (optional)</Label>
                  <p className="text-[10px] text-muted-foreground">
                    Override with hex (e.g. #3b82f6). Changes apply immediately.
                  </p>
                  <div className="grid gap-2">
                    {DRINK_TYPES.map((t) => {
                      const key = `custom_${t.id}` as keyof Pick<FormValues, "custom_water" | "custom_tea" | "custom_coffee" | "custom_other">;
                      const hex = watch(key);
                      const value = hex?.trim().match(/^#[0-9A-Fa-f]{6}$/) ? hex.trim() : "";
                      return (
                        <div key={t.id} className="flex items-center gap-2 rounded-none">
                          <ColorPicker
                            color={value || "#94a3b8"}
                            onChange={(newHex) => {
                              setValue(key, newHex);
                              applyColorLive({ [key]: newHex });
                            }}
                          />
                          <Input
                            className="flex-1 font-mono text-xs"
                            placeholder={`${t.label} (e.g. #3b82f6)`}
                            {...register(key, {
                              onChange: (e) => {
                                const v = e.target.value.trim();
                                if (v.match(/^#[0-9A-Fa-f]{6}$/)) applyColorLive({ [key]: v });
                              },
                            })}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter showCloseButton={false}>
                <Button onClick={() => setColorDialogOpen(false)}>Done</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {!isCheckingMigration && hasMigratableData && (
            <div className="border-t border-border pt-6">
              <p className="mb-1 text-xs font-medium text-muted-foreground">
                Cloud migration
              </p>
              <p className="mb-3 text-[11px] text-muted-foreground">
                Local IndexedDB data found. Migrate it to Supabase.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={handleMigrateToCloud}
                disabled={isMigrating}
              >
                {isMigrating ? "Migrating..." : "Migrate local data"}
              </Button>
              {(isMigrating || migrationDone) && (
                <div className="mt-3 space-y-1.5">
                  <div className="h-2 w-full overflow-hidden rounded bg-blue-100">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${migrationProgress}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-blue-600">
                    {migrationDone ? "Migration complete (100%)" : `Migrating... ${migrationProgress}%`}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t border-border pt-6">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Want to remove all data?
            </p>
            <Button
              type="button"
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => {
                if (
                  window.confirm(
                    "Clear all data? This will remove your profile, logs, streaks, and weekly history. This cannot be undone."
                  )
                ) {
                  clearAllData();
                  onDataCleared?.();
                  onOpenChange(false);
                }
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear all data
            </Button>
          </div>
          <div className="flex shrink-0 items-center justify-between gap-2 border-t border-border pt-6">
            <div className="flex items-center gap-2">
              <Button type="submit">
                Save
              </Button>
              <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
            </div>
            <Button variant="outline" type="button" onClick={handleLogout}>
              Logout
            </Button>
          </div>
      </form>
    </aside>
  );
}
