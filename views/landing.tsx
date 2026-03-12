"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { GlassWater } from "lucide-react";
import { PRODUCT_NAME, SPLASH_FROM_LANDING_KEY } from "@/constants";
import { Hero } from "@/components/hero";
import { ThemeToggle } from "@/components/theme-toggle";
import { WaterFillCta } from "@/components/water-fill-cta";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { HydrationChart } from "@/components/hydration-chart/hydration-chart";
import { QuickAddWater } from "@/components/hydration-controls/quick-add-water";
import { StreakCalendar } from "@/components/streak-calendar/streak-calendar";
import { StatsCard } from "@/components/stats-card/stats-card";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts/keyboard-shortcuts";
import type { UserData, WeeklyDaySummary } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

function yyyyMmDd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function makeLandingSample() {
  // Deterministic to avoid server/client hydration mismatches.
  // (Next.js pre-renders Client Components on the server too.)
  const base = new Date(2026, 2, 12, 12, 0, 0); // Mar 12, 2026 (local)
  const date = yyyyMmDd(base);
  const logs: UserData["logs"] = [
    { time: "09:20", amount: 250, drinkType: "water" },
    { time: "10:45", amount: 200, drinkType: "tea" },
    { time: "12:10", amount: 250, drinkType: "water" },
    { time: "14:05", amount: 180, drinkType: "coffee" },
    { time: "16:30", amount: 300, drinkType: "water" },
    { time: "18:15", amount: 270, drinkType: "water" },
  ];
  const waterConsumed = logs.reduce((sum, l) => sum + l.amount, 0);

  const data: UserData = {
    name: "Ava",
    profileImage: "",
    reminder_interval: 45,
    time_span: { start: "09:00", end: "19:00" },
    daily_goal: 2500,
    water_consumed: waterConsumed,
    num_times_consumed: logs.length,
    logs,
    date,
    chart_type: "radial",
    color_palette: "blue",
  };

  const streakHistory: Record<string, boolean> = {};
  for (let i = 0; i < 28; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const key = yyyyMmDd(d);
    streakHistory[key] = i % 5 !== 0; // sprinkle a few misses for realism
  }

  const weeklyHistory: WeeklyDaySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    weeklyHistory.push({
      date: yyyyMmDd(d),
      daily_goal: 2500,
      water_consumed: 1600 + (6 - i) * 120,
    });
  }

  return { data, streakHistory, weeklyHistory };
}

export function LandingPage() {
  const router = useRouter();
  const sample = useMemo(() => makeLandingSample(), []);

  const goToAppWithSplash = () => {
    try {
      sessionStorage.setItem(SPLASH_FROM_LANDING_KEY, "1");
    } catch {
      // ignore
    }
    router.push("/app");
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          className="absolute -bottom-56 -right-56 h-[900px] w-[900px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.85 0.08 252), transparent 55%), radial-gradient(circle at 60% 60%, oklch(0.623 0.214 259.815), transparent 55%)",
            opacity: 0.45,
            maskImage:
              "radial-gradient(circle at 60% 60%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0) 72%)",
            WebkitMaskImage:
              "radial-gradient(circle at 60% 60%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 35%, rgba(0,0,0,0) 72%)",
          }}
          animate={{ y: [0, 12, 0], x: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <span className="flex items-center gap-2 font-semibold text-foreground font-archivo">
          <GlassWater className="h-5 w-5 shrink-0" />
          {PRODUCT_NAME}
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={goToAppWithSplash}>
            Open app
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.985_0_0)] via-transparent to-transparent dark:from-[oklch(0.145_0_0)]" />
          </div>

          <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <Hero />

            <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-2 text-center">
              <div className="flex flex-col items-center gap-2 sm:flex-row">
                <WaterFillCta className="w-full sm:w-auto" label="Start tracking" />
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={goToAppWithSplash}
                >
                  See dashboard
                </Button>
              </div>
              <p className="text-xs text-muted-foreground font-archivo">
                Quick add (100/250/500ml), streaks, and charts all built for calm consistency.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-5xl px-4 pb-12 pt-6">
          <div className="mb-4">
            <p className="text-xs font-medium text-muted-foreground">Preview</p>
            <h2 className="mt-1 text-sm font-medium text-foreground font-archivo">
              A live sample of the UI
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              These are real components from the app, rendered with sample data.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-archivo">Hydration chart</CardTitle>
                <CardDescription>
                  See your progress and breakdown at a glance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HydrationChart
                  data={sample.data}
                  waterConsumed={sample.data.water_consumed}
                  dailyGoal={sample.data.daily_goal}
                  chartType={sample.data.chart_type}
                  colorPalette={sample.data.color_palette}
                />

                <div className="mt-4 border-t border-border/60 pt-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-medium text-muted-foreground">
                      Keyboard shortcuts
                    </p>
                    <KeyboardShortcuts />
                  </div>

                  <Separator />

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Add water</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>⌘</Kbd>
                        <Kbd>A</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Custom entry</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>⌘</Kbd>
                        <Kbd>C</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Logs &amp; goal</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>⌘</Kbd>
                        <Kbd>G</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Settings</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>⌘</Kbd>
                        <Kbd>S</Kbd>
                      </KbdGroup>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-archivo">Today&apos;s summary</CardTitle>
                  <CardDescription>
                    Simple stats that keep you consistent.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StatsCard
                    waterConsumed={sample.data.water_consumed}
                    dailyGoal={sample.data.daily_goal}
                    numTimesConsumed={sample.data.num_times_consumed}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-archivo">Streak</CardTitle>
                  <CardDescription>
                    Build momentum with daily wins.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <StreakCalendar
                    streakHistory={sample.streakHistory}
                    currentStreak={7}
                    longestStreak={18}
                    staticCurrentMonth
                  />
                </CardContent>
              </Card>
            </div>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="font-archivo">Quick add</CardTitle>
                <CardDescription>
                  One tap logging for water, tea, coffee, and more.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QuickAddWater onAdd={() => {}} />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

