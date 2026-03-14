"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { usePlatform } from "@/hooks/usePlatform";

type ThemeToggleProps = {
  /** Show keyboard shortcut in tooltip (default true) */
  showShortcut?: boolean;
};

export function ThemeToggle({ showShortcut = true }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { modSymbol } = usePlatform();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          <span className="relative flex h-4 w-4 items-center justify-center">
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="flex items-center gap-1.5">
        {mounted ? (isDark ? "Light mode" : "Dark mode") : "Theme"}
        {showShortcut && (
          <KbdGroup className="shrink-0">
            <Kbd>{modSymbol}</Kbd>
            <Kbd>⇧</Kbd>
            <Kbd>T</Kbd>
          </KbdGroup>
        )}
      </TooltipContent>
    </Tooltip>
  );
}
