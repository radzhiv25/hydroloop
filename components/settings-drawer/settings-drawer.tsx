"use client";

import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "motion/react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
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
  DEFAULT_REMINDER_INTERVAL,
  CHART_TYPES,
  COLOR_PALETTES,
  DEFAULT_CHART_TYPE,
  DEFAULT_COLOR_PALETTE,
  DRINK_TYPES,
} from "@/constants/hydration";
import { Trash2, Palette } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
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

type SettingsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserData | null;
  onSave: (updates: Partial<UserData>) => void;
  onLiveColorUpdate?: (updates: Partial<UserData>) => void;
  onDataCleared?: () => void;
};

export function SettingsDrawer({
  open,
  onOpenChange,
  data,
  onSave,
  onLiveColorUpdate,
  onDataCleared,
}: SettingsDrawerProps) {
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormValues>(
    {
      defaultValues: data
        ? {
            name: data.name,
            profileImage: data.profileImage,
            reminder_interval: data.reminder_interval,
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
  const reminderInterval = watch("reminder_interval");
  const dailyGoal = watch("daily_goal");
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
    if (open && data) {
      reset({
        name: data.name,
        profileImage: data.profileImage,
        reminder_interval: data.reminder_interval,
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

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="h-full max-h-none">
        <motion.div
          className="flex h-full flex-col"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <DrawerHeader>
            <DrawerTitle>Settings</DrawerTitle>
            <DrawerDescription>
              Update your profile and reminder preferences.
            </DrawerDescription>
          </DrawerHeader>
          <form
          id="settings-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 pb-4"
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
              Danger zone
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
        <DrawerFooter>
          <Button type="submit" form="settings-form">
            Save
          </Button>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
        </motion.div>
      </DrawerContent>
    </Drawer>
  );
}
