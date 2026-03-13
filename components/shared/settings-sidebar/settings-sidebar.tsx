"use client";

import { useEffect, useCallback, useRef, useState } from "react";
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
import { clearAllData } from "@/lib/storage";
import {
  MIN_DAILY_GOAL,
  MAX_DAILY_GOAL,
  DAILY_GOAL_PRESETS,
  DEFAULT_REMINDER_INTERVAL,
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
import { uploadSoundToCloudinary } from "@/lib/cloudinary";
import { playReminderSoundForDuration } from "@/hooks/useReminder";
import { Trash2, Palette, Volume2, X, Upload, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { ColorPicker } from "@/components/ui/color-picker";
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
  daily_goal: z.number().min(MIN_DAILY_GOAL).max(MAX_DAILY_GOAL),
  chart_type: z.enum(["line", "bar", "area", "radar", "radial"]),
  color_palette: z.string(),
  custom_water: z.string().optional(),
  custom_tea: z.string().optional(),
  custom_coffee: z.string().optional(),
  custom_other: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

type SettingsSidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserData | null;
  onSave: (updates: Partial<UserData>) => void;
  onLiveColorUpdate?: (updates: Partial<UserData>) => void;
  onDataCleared?: () => void;
};

export function SettingsSidebar({
  open,
  onOpenChange,
  data,
  onSave,
  onLiveColorUpdate,
  onDataCleared,
}: SettingsSidebarProps) {
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
            daily_goal: data.daily_goal,
            chart_type: data.chart_type ?? DEFAULT_CHART_TYPE,
            color_palette: data.color_palette ?? DEFAULT_COLOR_PALETTE,
            custom_water: data.custom_chart_colors?.water ?? "",
            custom_tea: data.custom_chart_colors?.tea ?? "",
            custom_coffee: data.custom_chart_colors?.coffee ?? "",
            custom_other: data.custom_chart_colors?.other ?? "",
          }
        : undefined,
    }
  );

  const [colorDialogOpen, setColorDialogOpen] = useState(false);
  const [soundUploading, setSoundUploading] = useState(false);
  const [soundUploadError, setSoundUploadError] = useState<string | null>(null);
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
    if (open && data) {
      skipSoundOnNextChangeRef.current = true;
      reset({
        name: data.name,
        profileImage: data.profileImage,
        reminder_interval: data.reminder_interval,
        reminder_sound: data.reminder_sound ?? DEFAULT_REMINDER_SOUND,
        custom_sound_url: data.custom_sound_url ?? "",
        reminder_sound_duration_seconds: data.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
        time_start: data.time_span.start,
        time_end: data.time_span.end,
        daily_goal: data.daily_goal,
        chart_type: data.chart_type ?? DEFAULT_CHART_TYPE,
        color_palette: data.color_palette ?? DEFAULT_COLOR_PALETTE,
        custom_water: data.custom_chart_colors?.water ?? "",
        custom_tea: data.custom_chart_colors?.tea ?? "",
        custom_coffee: data.custom_chart_colors?.coffee ?? "",
        custom_other: data.custom_chart_colors?.other ?? "",
      });
      const t = setTimeout(() => {
        skipSoundOnNextChangeRef.current = false;
      }, 150);
      return () => clearTimeout(t);
    }
  }, [open, data, reset]);

  const onSubmit = (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    const v = parsed.data;
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
    onSave({
      name: v.name,
      profileImage: v.profileImage,
      reminder_interval: v.reminder_interval,
      reminder_sound: v.reminder_sound || DEFAULT_REMINDER_SOUND,
      custom_sound_url: v.reminder_sound === REMINDER_SOUND_CUSTOM ? (v.custom_sound_url?.trim() || undefined) : undefined,
      reminder_sound_duration_seconds: v.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION,
      time_span: { start: v.time_start, end: v.time_end },
      daily_goal: v.daily_goal,
      chart_type: v.chart_type,
      color_palette: (Object.keys(COLOR_PALETTES).includes(v.color_palette)
        ? v.color_palette
        : DEFAULT_COLOR_PALETTE) as ColorPaletteId,
      custom_chart_colors,
    });
    onOpenChange(false);
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
            <Label>Appearance</Label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Theme</span>
              <ThemeToggle />
            </div>
          </div>
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
                    <SelectItem key={s.id} value={s.id}>
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
                onValueChange={([v]) => setValue("reminder_sound_duration_seconds", v)}
              />
              <span className="min-w-[2rem] text-xs tabular-nums">
                {reminderSoundDuration}s
              </span>
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
            <Label>Daily goal (ml)</Label>
            <div className="flex flex-wrap gap-2">
              {DAILY_GOAL_PRESETS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={(dailyGoal ?? 2500) === preset ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValue("daily_goal", preset)}
                >
                  {preset} ml
                </Button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Slider
                min={MIN_DAILY_GOAL}
                max={MAX_DAILY_GOAL}
                step={250}
                value={[dailyGoal ?? 2500]}
                onValueChange={([v]) => setValue("daily_goal", v)}
              />
              <span className="min-w-[3rem] text-xs tabular-nums">
                {dailyGoal ?? 2500} ml
              </span>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="settings-chart_type">Graph type</Label>
            <Select
              value={watch("chart_type") ?? DEFAULT_CHART_TYPE}
              onValueChange={(v) => setValue("chart_type", v as FormValues["chart_type"])}
            >
              <SelectTrigger id="settings-chart_type">
                <SelectValue placeholder="Graph type" />
              </SelectTrigger>
              <SelectContent>
                {CHART_TYPES.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                    className="h-5 w-5 shrink-0 rounded border border-border"
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
                    <SelectTrigger id="dialog-color_palette">
                      <SelectValue placeholder="Color palette" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(COLOR_PALETTES).map((id) => (
                        <SelectItem key={id} value={id}>
                          {id.charAt(0).toUpperCase() + id.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Preview</Label>
                  <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-muted/30 p-3">
                    {DRINK_TYPES.map((t) => (
                      <div key={t.id} className="flex items-center gap-2">
                        <div
                          className="h-8 w-8 shrink-0 rounded-md border border-border"
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
                        <div key={t.id} className="flex items-center gap-2">
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
      </form>
      <div className="flex shrink-0 gap-2 border-t border-border px-4 py-3">
        <Button type="submit" form="settings-form">
          Save
        </Button>
        <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
      </div>
    </aside>
  );
}
