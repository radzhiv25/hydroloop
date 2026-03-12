"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Minus, Plus, Trash2, Volume2, VolumeX } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { UserData } from "@/lib/types";
import {
  MIN_DAILY_GOAL,
  MAX_DAILY_GOAL,
  GOAL_STEP,
  DAILY_GOAL_PRESETS,
} from "@/constants/hydration";

type LogsDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: UserData | null;
  onDeleteLog: (index: number) => void;
  onSetGoal: (goal: number) => void;
};

export function LogsDrawer({
  open,
  onOpenChange,
  data,
  onDeleteLog,
  onSetGoal,
}: LogsDrawerProps) {
  const [activeTab, setActiveTab] = useState("logs");
  const [draftGoal, setDraftGoal] = useState(data?.daily_goal ?? 2500);
  const [goalSoundMuted, setGoalSoundMuted] = useState(false);
  const goalAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (open && data) setDraftGoal(data.daily_goal);
  }, [open, data?.daily_goal]);

  const progress =
    data && data.daily_goal > 0
      ? Math.min(1, data.water_consumed / data.daily_goal)
      : 0;

  const goalBarHeights = useMemo(() => {
    const seed = draftGoal / 500;
    return Array.from({ length: 24 }, (_, i) => {
      const t = (i / 23) * Math.PI * 2 + seed * 0.5;
      const raw = 0.25 + 0.75 * (Math.sin(t) * 0.5 + 0.5);
      return Math.round(raw * 100) / 100;
    });
  }, [draftGoal]);

  const handleSubmitGoal = () => {
    onSetGoal(draftGoal);
    onOpenChange(false);
  };

  useEffect(() => {
    if (!open || activeTab !== "goal" || goalSoundMuted) {
      if (goalAudioRef.current) {
        goalAudioRef.current.pause();
        goalAudioRef.current.currentTime = 0;
        goalAudioRef.current = null;
      }
      return;
    }

    const audio = new Audio("/sounds/hydroloop_goal_2.mp3");
    audio.loop = true;
    audio.volume = 0.6;
    goalAudioRef.current = audio;
    audio.play().catch(() => {});

    return () => {
      audio.pause();
      audio.currentTime = 0;
      if (goalAudioRef.current === audio) {
        goalAudioRef.current = null;
      }
    };
  }, [open, activeTab, goalSoundMuted]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="left-0 right-0 flex max-h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border-t shadow-lg">
        <div className="mx-auto flex w-full min-h-0 flex-1 flex-col md:max-w-[50vw]">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <DrawerHeader className="shrink-0 pb-2 text-center">
            <DrawerTitle className="text-base">Logs &amp; Goal</DrawerTitle>
            <DrawerDescription className="text-xs">
              Manage your intake logs or set your daily goal
            </DrawerDescription>
            <TabsList className="mt-3 w-full" variant="default">
              <TabsTrigger value="logs" className="flex-1">
                Logs
              </TabsTrigger>
              <TabsTrigger value="goal" className="flex-1">
                Move Goal
              </TabsTrigger>
            </TabsList>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
            <TabsContent value="logs" className="mt-0">
              {data?.logs.length ? (
                <ul className="space-y-2">
                  {data.logs.map((log, index) => (
                    <motion.li
                      key={`${log.time}-${log.amount}-${index}`}
                      className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2"
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-sm tabular-nums text-foreground">
                        {log.time} — {log.amount} ml
                        {log.drinkType && log.drinkType !== "water" ? ` (${log.drinkType})` : ""}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => onDeleteLog(index)}
                        aria-label="Delete log"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No logs today. Add water from the quick add buttons.
                </p>
              )}
            </TabsContent>

            <TabsContent value="goal" className="mt-0">
              <div className="flex flex-col items-center gap-4 py-2">
                <p className="text-center text-xs text-muted-foreground">
                  Set your daily water goal.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded border border-border px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted/60"
                  onClick={() => setGoalSoundMuted((prev) => !prev)}
                >
                  {goalSoundMuted ? (
                    <>
                      <VolumeX className="h-3.5 w-3.5" />
                      Mute off
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-3.5 w-3.5" />
                      Mute on
                    </>
                  )}
                </button>
                <div className="flex flex-wrap justify-center gap-2">
                  {DAILY_GOAL_PRESETS.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      variant={draftGoal === preset ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDraftGoal(preset)}
                    >
                      {preset} ml
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setDraftGoal((g) =>
                        Math.max(MIN_DAILY_GOAL, g - GOAL_STEP)
                      )
                    }
                    disabled={draftGoal <= MIN_DAILY_GOAL}
                    aria-label="Decrease goal"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-bold tabular-nums text-foreground">
                      {draftGoal}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ml/day
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() =>
                      setDraftGoal((g) =>
                        Math.min(MAX_DAILY_GOAL, g + GOAL_STEP)
                      )
                    }
                    disabled={draftGoal >= MAX_DAILY_GOAL}
                    aria-label="Increase goal"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex w-full gap-0.5">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const segmentProgress = (i + 1) / 12;
                    const filled = progress >= segmentProgress;
                    return (
                      <motion.div
                        key={i}
                        className="h-2 flex-1 rounded-sm bg-muted"
                        initial={false}
                        animate={{
                          backgroundColor: filled
                            ? "oklch(var(--primary))"
                            : "oklch(var(--muted))",
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    );
                  })}
                </div>
                <div
                  key="goal-wave-bars"
                  className="flex w-max items-end justify-center gap-0.5 px-2 py-3"
                  aria-hidden
                >
                  {goalBarHeights.map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 flex-shrink-0 rounded-sm bg-primary"
                      initial={{ height: "8px" }}
                      animate={{
                        height: ["8px", "42px", "8px"],
                      }}
                      transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: i * 0.06,
                      }}
                      style={{ minHeight: 8 }}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
          </div>

          {activeTab === "goal" && (
            <DrawerFooter className="shrink-0 border-t border-border pt-4">
              <Button onClick={handleSubmitGoal}>Save</Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          )}
        </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
