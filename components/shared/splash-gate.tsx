"use client";

import { useEffect, useState } from "react";
import {
  SPLASH_STORAGE_KEY,
  SPLASH_INTERVAL_MS,
  SPLASH_SCREENSHOT_MODE,
  SPLASH_FROM_LANDING_KEY,
} from "@/constants";
import { kvGet, kvSet } from "@/lib/db";
import { SplashPage } from "@/screens/splash";

type SplashGateProps = {
  children: React.ReactNode;
};

async function getShowSplash(): Promise<boolean> {
  if (SPLASH_SCREENSHOT_MODE) return true;
  if (typeof window === "undefined") return true;
  try {
    if (sessionStorage.getItem(SPLASH_FROM_LANDING_KEY) === "1") return true;
    const raw = await kvGet(SPLASH_STORAGE_KEY);
    if (!raw) return true;
    const lastAt = Number(raw);
    if (Number.isNaN(lastAt)) return true;
    return Date.now() - lastAt >= SPLASH_INTERVAL_MS;
  } catch {
    return true;
  }
}

async function saveSplashDone(): Promise<void> {
  await kvSet(SPLASH_STORAGE_KEY, String(Date.now()));
}

function clearFromLandingFlag(): void {
  try {
    sessionStorage.removeItem(SPLASH_FROM_LANDING_KEY);
  } catch {
    // ignore
  }
}

export function SplashGate({ children }: SplashGateProps) {
  const [showSplash, setShowSplash] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      const value = await getShowSplash();
      setShowSplash(value);
    })();
  }, []);

  const handleSplashComplete = () => {
    if (SPLASH_SCREENSHOT_MODE) return;
    clearFromLandingFlag();
    void saveSplashDone();
    setShowSplash(false);
  };

  if (showSplash === null) {
    return (
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="h-6 w-6 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (showSplash) {
    return <SplashPage onComplete={handleSplashComplete} />;
  }

  return <>{children}</>;
}
