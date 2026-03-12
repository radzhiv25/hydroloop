"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRODUCT_NAME } from "@/constants";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts/keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, User, GlassWater } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import type { UserData } from "@/lib/types";

type NavbarProps = {
  userData: UserData | null;
  onOpenSettings: () => void;
  /** When true, settings is open (triggers icon spin when opened via keyboard). */
  settingsOpen?: boolean;
};

export function Navbar({ userData, onOpenSettings, settingsOpen }: NavbarProps) {
  const name = userData?.name?.trim() || "Guest";
  const profileImage = userData?.profileImage;
  const [spinKey, setSpinKey] = useState(0);
  const prevSettingsOpen = useRef(settingsOpen ?? false);

  // Trigger spin when settings is opened via keyboard (parent sets settingsOpen to true).
  useEffect(() => {
    const open = settingsOpen ?? false;
    if (open && !prevSettingsOpen.current) {
      setSpinKey((k) => k + 1);
    }
    prevSettingsOpen.current = open;
  }, [settingsOpen]);

  const handleOpenSettings = () => {
    setSpinKey((k) => k + 1);
    onOpenSettings();
  };

  return (
    <header className="flex w-full cursor-pointer items-center justify-between border-b border-border py-3 px-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold text-foreground font-archivo"
        aria-label="Go to landing page"
      >
        <GlassWater className="h-5 w-5 shrink-0" />
        {PRODUCT_NAME}
      </Link>
      <div className="flex items-center gap-2">
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
        <ThemeToggle />
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
            Settings <Kbd>⌘</Kbd> + <Kbd>S</Kbd>
          </TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}
