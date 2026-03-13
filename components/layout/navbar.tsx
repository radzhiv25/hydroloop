"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PRODUCT_NAME, GITHUB_URL } from "@/constants";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { KeyboardShortcuts } from "@/components/dashboard/keyboard-shortcuts/keyboard-shortcuts";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Settings, User, GlassWater, Github } from "lucide-react";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { usePlatform } from "@/hooks/usePlatform";
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
  const [githubHovered, setGithubHovered] = useState(false);
  const prevSettingsOpen = useRef(settingsOpen ?? false);
  const { modSymbol } = usePlatform();

  // Trigger spin when settings is opened via keyboard (parent sets settingsOpen to true).
  useEffect(() => {
    const open = settingsOpen ?? false;
    if (open && !prevSettingsOpen.current) {
      setSpinKey((k) => k + 1);
    }
    prevSettingsOpen.current = open;
  }, [settingsOpen]);

  // GitHub shortcut: Cmd/Ctrl + Shift + G
  useEffect(() => {
    const handleGithubKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "g") {
        e.preventDefault();
        setGithubHovered(true);
        setTimeout(() => setGithubHovered(false), 300);
        window.open(GITHUB_URL, "_blank", "noopener,noreferrer");
      }
    };
    window.addEventListener("keydown", handleGithubKey);
    return () => window.removeEventListener("keydown", handleGithubKey);
  }, []);

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
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              asChild
              onMouseEnter={() => setGithubHovered(true)}
              onMouseLeave={() => setGithubHovered(false)}
              aria-label="View on GitHub"
            >
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github
                  className={`h-4 w-4 transition-colors duration-200 ${
                    githubHovered
                      ? "text-[#6e5494]"
                      : "text-muted-foreground"
                  }`}
                />
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="flex items-center gap-1.5">
            GitHub <Kbd>{modSymbol}</Kbd> + <Kbd>⇧</Kbd> + <Kbd>G</Kbd>
          </TooltipContent>
        </Tooltip>
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
      </div>
    </header>
  );
}
