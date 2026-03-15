"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, ArrowRight, Copy, Check } from "lucide-react";
import { SPLASH_FROM_LANDING_KEY } from "@/constants";
import { Hero } from "@/components/landing/hero";
import { WaterFillCta } from "@/components/landing/water-fill-cta";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { HydrationChart } from "@/components/dashboard/hydration-chart/hydration-chart";
import { QuickAddWater } from "@/components/dashboard/hydration-controls/quick-add-water";
import { StreakCalendar } from "@/components/dashboard/streak-calendar/streak-calendar";
import { StatsCard } from "@/components/dashboard/stats-card/stats-card";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts";
import { usePlatform } from "@/hooks/usePlatform";
import type { UserData, WeeklyDaySummary } from "@/lib/types";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const INSTALL_COMMAND = "npm i -g hydroloop";

function CliInstallBlock() {
  const [hovered, setHovered] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="inline-flex items-center rounded-none border border-zinc-800 bg-zinc-950 p-1 transition-all hover:border-zinc-600">
      <button
        onClick={copyCommand}
        className="group flex items-center gap-2 px-4 py-2 transition-colors hover:bg-zinc-900"
        title="Copy to clipboard"
      >
        <code className="font-mono text-sm text-zinc-100">
          <span className="text-zinc-500">$</span> {INSTALL_COMMAND}
        </code>
        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-green-400"
            >
              <Check className="h-3.5 w-3.5" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-zinc-500 transition-colors group-hover:text-zinc-300"
            >
              <Copy className="h-3.5 w-3.5" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
      <Link
        href="/cli"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative h-8 overflow-hidden rounded-none bg-zinc-800 px-3 text-sm font-medium text-zinc-100 flex items-center gap-1.5"
      >
        <span className="relative z-10 flex items-center gap-1.5">
          Learn more
          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200" style={{ transform: hovered ? 'translateX(2px)' : 'translateX(0)' }} />
        </span>
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 z-0 origin-left bg-gradient-to-r from-[oklch(0.623_0.214_259.815)] via-[oklch(0.809_0.105_251.813)] to-[oklch(0.85_0.08_252)]"
          initial={{ scaleX: 0 }}
          animate={hovered ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </Link>
    </div>
  );
}

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
  const { modSymbol } = usePlatform();

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
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden opacity-40 dark:opacity-30">
        {/* Mesh gradient with multiple animated blobs spread throughout */}
        <motion.div
          className="absolute -left-32 -top-32 h-[500px] w-[500px] rounded-full blur-[150px]"
          style={{ background: "oklch(0.8 0.12 250)" }}
          animate={{ 
            x: [0, 20, 0], 
            y: [0, 30, 0],
          }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -right-24 top-1/4 h-[450px] w-[450px] rounded-full blur-[130px]"
          style={{ background: "oklch(0.75 0.14 255)" }}
          animate={{ 
            x: [0, -30, 0], 
            y: [0, -20, 0],
          }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 left-1/4 h-[550px] w-[550px] rounded-full blur-[140px]"
          style={{ background: "oklch(0.7 0.15 245)" }}
          animate={{ 
            x: [0, 25, 0], 
            y: [0, -15, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-24 h-[400px] w-[400px] rounded-full blur-[120px]"
          style={{ background: "oklch(0.85 0.1 260)" }}
          animate={{ 
            x: [0, -20, 0], 
            y: [0, 25, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[100px]"
          style={{ background: "oklch(0.9 0.08 240)" }}
          animate={{ 
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <Navbar variant="site" onOpenApp={goToAppWithSplash} />

      <main className="flex flex-1 flex-col">
        <section className="relative">
          <div className="mx-auto w-full max-w-3xl px-4 py-8">
            <Hero />

            <div className="mx-auto mt-4 flex max-w-xl flex-col items-center gap-3 text-center">
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
              <a 
                href="#cli" 
                className="mt-1 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors font-archivo"
              >
                <Terminal className="h-3 w-3" />
                Prefer the terminal? Try the CLI
              </a>
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
                    <KeyboardShortcuts disabled />
                  </div>

                  <Separator />

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Add water</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>{modSymbol}</Kbd>
                        <Kbd>A</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Custom entry</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>{modSymbol}</Kbd>
                        <Kbd>C</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Logs &amp; goal</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>{modSymbol}</Kbd>
                        <Kbd>G</Kbd>
                      </KbdGroup>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground">Settings</span>
                      <KbdGroup className="shrink-0">
                        <Kbd>{modSymbol}</Kbd>
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

        <section id="cli" className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10 scroll-mt-16">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              For terminal lovers
            </div>
            <h2 className="text-2xl font-bold tracking-tight font-archivo sm:text-3xl">
              Hydroloop CLI
            </h2>
            <p className="max-w-lg text-muted-foreground">
              Track hydration without leaving your terminal. Quick logging,
              background reminders with sound, and streak tracking — all from
              the command line.
            </p>
            <CliInstallBlock />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

