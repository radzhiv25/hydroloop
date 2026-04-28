"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRODUCT_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, User, GlassWater } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { usePlatform } from "@/hooks/usePlatform";
import type { UserData } from "@/lib/types";

type NavbarProps = {
  /** "app" for dashboard with user/settings, "site" for landing/marketing pages */
  variant?: "app" | "site";
  /** Required for "app" variant */
  userData?: UserData | null;
  /** Required for "app" variant */
  onOpenSettings?: () => void;
  /** When true, settings is open (triggers icon spin when opened via keyboard). */
  settingsOpen?: boolean;
  /** Custom action for "Open app" button in "site" variant */
  onOpenApp?: () => void;
};

export function Navbar({
  variant = "app",
  userData,
  onOpenSettings,
  settingsOpen,
  onOpenApp,
}: NavbarProps) {
  const isApp = variant === "app";
  const name = userData?.name?.trim() || "Guest";
  const profileImage = userData?.profileImage;
  const [spinKey, setSpinKey] = useState(0);
  const prevSettingsOpen = useRef(settingsOpen ?? false);
  const { modSymbol } = usePlatform();

  useEffect(() => {
    if (!isApp) return;
    const open = settingsOpen ?? false;
    if (open && !prevSettingsOpen.current) {
      setSpinKey((k) => k + 1);
    }
    prevSettingsOpen.current = open;
  }, [settingsOpen, isApp]);

  const handleOpenSettings = () => {
    setSpinKey((k) => k + 1);
    onOpenSettings?.();
  };

  return (
    <header className="flex w-full items-center justify-between border-b border-border py-3 px-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-foreground font-archivo"
        aria-label="Go to landing page"
      >
        <GlassWater className="h-5 w-5 shrink-0" />
        {PRODUCT_NAME}
      </Link>
      <div className="flex items-center gap-2">
        {isApp && (
          <>
            <span className="text-xs text-muted-foreground font-archivo hidden sm:inline">
              {name}
            </span>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </>
        )}
        {isApp && (
          <>
            <KeyboardShortcuts />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenSettings}
                  aria-label="Open settings"
                >
                  <span key={spinKey} className="inline-block animate-settings-icon-spin">
                    <Settings className="h-4 w-4" />
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="flex items-center gap-1.5">
                Settings <Kbd>{modSymbol}</Kbd> + <Kbd>S</Kbd>
              </TooltipContent>
            </Tooltip>
          </>
        )}
        {!isApp && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/changelog">Changelog</Link>
            </Button>
            {onOpenApp ? (
              <Button variant="outline" size="sm" onClick={onOpenApp}>
                Open app
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href="/app">Open app</Link>
              </Button>
            )}
          </>
        )}
        <ThemeToggle showShortcut={isApp} />
      </div>
    </header>
  );
}
