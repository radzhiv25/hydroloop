"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import {
  MIN_DAILY_GOAL,
  MAX_DAILY_GOAL,
  GOAL_STEP,
} from "@/constants/hydration";

type GoalSelectorProps = {
  dailyGoal: number;
  waterConsumed: number;
  onGoalChange: (goal: number) => void;
};

export function GoalSelector({
  dailyGoal,
  waterConsumed,
  onGoalChange,
}: GoalSelectorProps) {
  const decrement = () =>
    onGoalChange(Math.max(MIN_DAILY_GOAL, dailyGoal - GOAL_STEP));
  const increment = () =>
    onGoalChange(Math.min(MAX_DAILY_GOAL, dailyGoal + GOAL_STEP));
  const progress = dailyGoal > 0 ? Math.min(1, waterConsumed / dailyGoal) : 0;

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-muted-foreground">
        Daily Water Goal
      </p>
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={dailyGoal <= MIN_DAILY_GOAL}
          aria-label="Decrease goal"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[5rem] text-center text-xl font-semibold tabular-nums">
          {dailyGoal} ml
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={dailyGoal >= MAX_DAILY_GOAL}
          aria-label="Increase goal"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex gap-0.5">
        {Array.from({ length: 12 }).map((_, i) => {
          const segmentProgress = (i + 1) / 12;
          const filled = progress >= segmentProgress;
          return (
            <motion.div
              key={i}
              className="h-2 flex-1 rounded-sm bg-muted"
              initial={false}
              animate={{
                backgroundColor: filled ? "oklch(var(--primary))" : "oklch(var(--muted))",
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
      </div>
    </div>
  );
}
