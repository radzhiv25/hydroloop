"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AppShell } from "@/components/layout/app-shell";
import { WelcomeDialog } from "@/components/shared/welcome-dialog";
import { SettingsSidebar } from "@/components/shared/settings-sidebar";
import { LogsDrawer } from "@/components/dashboard/logs-drawer";
import { CustomEntryDialog } from "@/components/dashboard/custom-entry-dialog";
import { HydrationDashboard } from "@/components/dashboard/hydration-dashboard/hydration-dashboard";
import { useHydration } from "@/hooks/useHydration";
import { useHydrationHotkeys } from "@/hooks/useHotkeys";
import { useReminder } from "@/hooks/useReminder";
import { useShortcutHint } from "@/components/dashboard/shortcut-hint/shortcut-hint";
import { getUserData } from "@/lib/storage";
import { toast } from "sonner";

export function MainPage() {
  const {
    data,
    addWater,
    setDailyGoal,
    deleteLog,
    updateSettings,
    refetch,
    streakHistory,
    weeklyHistory,
    currentStreak,
    longestStreak,
  } = useHydration();

  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [logsDrawerOpen, setLogsDrawerOpen] = useState(false);
  const [customEntryOpen, setCustomEntryOpen] = useState(false);
  const [isRefreshingAfterSettings, setIsRefreshingAfterSettings] = useState(false);

  const showWelcome = () => {
    void (async () => {
      const stored = await getUserData();
      const hasName = stored?.name?.trim();
      if (!hasName) setWelcomeOpen(true);
    })();
  };

  useEffect(() => {
    showWelcome();
  }, []);

  const { setTheme, resolvedTheme } = useTheme();
  const { showHint } = useShortcutHint();
  useReminder(data);

  useEffect(() => {
    const handleThemeKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "t") {
        e.preventDefault();
        showHint([typeof navigator !== "undefined" && /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "⌃", "⇧", "T"]);
        setTheme(resolvedTheme === "dark" ? "light" : "dark");
      }
    };
    window.addEventListener("keydown", handleThemeKey);
    return () => window.removeEventListener("keydown", handleThemeKey);
  }, [resolvedTheme, setTheme, showHint]);

  useHydrationHotkeys({
    onAddWater: () => {
      addWater(250);
      toast.success("Added 250 ml");
    },
    onChangeGoal: () => setLogsDrawerOpen((prev) => !prev),
    onOpenSettings: () => setSettingsOpen((prev) => !prev),
    onCustomEntry: () => {
      setCustomEntryOpen(true);
    },
    onShortcutUsed: showHint,
    enabled: !!data && !welcomeOpen,
  });

  return (
    <>
      <AppShell
        userData={data}
        onOpenSettings={() => setSettingsOpen((prev) => !prev)}
        settingsOpen={settingsOpen}
      >
        <div className="min-w-0 flex-1 flex flex-col">
          {data ? (
            <HydrationDashboard
              data={data}
              addWater={(amount, _time?, drinkType?) => {
                addWater(amount, undefined, drinkType);
                toast.success(`Added ${amount} ml`);
              }}
              setDailyGoal={setDailyGoal}
              onOpenLogsDrawer={() => setLogsDrawerOpen(true)}
              streakHistory={streakHistory}
              weeklyHistory={weeklyHistory}
              currentStreak={currentStreak}
              longestStreak={longestStreak}
              isRefreshing={isRefreshingAfterSettings}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-4">
              <div className="h-8 w-8 animate-pulse rounded bg-muted" />
            </div>
          )}
        </div>

      <SettingsSidebar
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        data={data}
        onSave={(updates) => {
          updateSettings(updates);
          setIsRefreshingAfterSettings(true);
          toast.success("Settings saved");
          setTimeout(() => setIsRefreshingAfterSettings(false), 800);
        }}
        onLiveColorUpdate={(updates) => {
          updateSettings(updates);
        }}
        onDataCleared={() => {
          refetch();
          setWelcomeOpen(true);
          toast.success("All data cleared");
        }}
      />
      </AppShell>

      <WelcomeDialog
        open={welcomeOpen}
        onOpenChange={setWelcomeOpen}
        onComplete={() => {
          refetch();
        }}
      />

      <LogsDrawer
        open={logsDrawerOpen}
        onOpenChange={setLogsDrawerOpen}
        data={data}
        onDeleteLog={(index) => {
          deleteLog(index);
          toast.success("Log removed");
        }}
        onSetGoal={(goal) => {
          setDailyGoal(goal);
          toast.success("Goal updated");
        }}
      />

      <CustomEntryDialog
        open={customEntryOpen}
        onOpenChange={setCustomEntryOpen}
        onSubmit={(amount) => {
          addWater(amount);
          toast.success(`Added ${amount} ml`);
        }}
      />
    </>
  );
}
