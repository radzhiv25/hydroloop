"use client";

import { useEffect } from "react";
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
} from "@/constants/hydration";
import { Trash2 } from "lucide-react";

const schema = z.object({
  name: z.string(),
  profileImage: z.string(),
  reminder_interval: z.number().min(5).max(120),
  time_start: z.string(),
  time_end: z.string(),
  daily_goal: z.number().min(MIN_DAILY_GOAL).max(MAX_DAILY_GOAL),
  chart_type: z.enum(["line", "bar", "area", "radar", "radial"]),
  color_palette: z.string(),
});

type FormValues = z.infer<typeof schema>;

type SettingsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserData | null;
  onSave: (updates: Partial<UserData>) => void;
  onDataCleared?: () => void;
};

export function SettingsDrawer({
  open,
  onOpenChange,
  data,
  onSave,
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
          }
        : undefined,
    }
  );

  const reminderInterval = watch("reminder_interval");
  const dailyGoal = watch("daily_goal");

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
      });
    }
  }, [open, data, reset]);

  const onSubmit = (values: FormValues) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) return;
    const v = parsed.data;
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
            <Label htmlFor="settings-color_palette">Color palette</Label>
            <Select
              value={watch("color_palette") ?? DEFAULT_COLOR_PALETTE}
              onValueChange={(v) => setValue("color_palette", v)}
            >
              <SelectTrigger id="settings-color_palette">
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
