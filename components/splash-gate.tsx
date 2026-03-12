"use client";

import { useEffect, useState } from "react";
import {
  SPLASH_STORAGE_KEY,
  SPLASH_INTERVAL_MS,
  SPLASH_SCREENSHOT_MODE,
  SPLASH_FROM_LANDING_KEY,
} from "@/constants";
import { SplashPage } from "@/views/splash";

type SplashGateProps = {
  children: React.ReactNode;
};

function getShowSplash(): boolean {
  if (SPLASH_SCREENSHOT_MODE) return true;
  if (typeof window === "undefined") return true;
  try {
    if (sessionStorage.getItem(SPLASH_FROM_LANDING_KEY) === "1") return true;
    const raw = localStorage.getItem(SPLASH_STORAGE_KEY);
    if (!raw) return true;
    const lastAt = Number(raw);
    if (Number.isNaN(lastAt)) return true;
    return Date.now() - lastAt >= SPLASH_INTERVAL_MS;
  } catch {
    return true;
  }
}

function saveSplashDone(): void {
  try {
    localStorage.setItem(SPLASH_STORAGE_KEY, String(Date.now()));
  } catch {
    // ignore
  }
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
    setShowSplash(getShowSplash());
  }, []);

  const handleSplashComplete = () => {
    if (SPLASH_SCREENSHOT_MODE) return;
    clearFromLandingFlag();
    saveSplashDone();
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
