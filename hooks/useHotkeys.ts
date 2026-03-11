"use client";

import { useEffect } from "react";

function isMac() {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

function modifierSymbol() {
  return isMac() ? "⌘" : "⌃";
}

type HotkeysConfig = {
  onAddWater?: () => void;
  onChangeGoal?: () => void;
  onOpenSettings?: () => void;
  onCustomEntry?: () => void;
  onShortcutUsed?: (keys: string[]) => void;
  enabled?: boolean;
};

export function useHydrationHotkeys({
  onAddWater,
  onChangeGoal,
  onOpenSettings,
  onCustomEntry,
  onShortcutUsed,
  enabled = true,
}: HotkeysConfig) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const key = e.key.toLowerCase();

      if (key === "a" && onAddWater) {
        e.preventDefault();
        onShortcutUsed?.([modifierSymbol(), "A"]);
        onAddWater();
      } else if (key === "g" && onChangeGoal) {
        e.preventDefault();
        onShortcutUsed?.([modifierSymbol(), "G"]);
        onChangeGoal();
      } else if (key === "s" && onOpenSettings) {
        e.preventDefault();
        onShortcutUsed?.([modifierSymbol(), "S"]);
        onOpenSettings();
      } else if (key === "c" && onCustomEntry) {
        e.preventDefault();
        onShortcutUsed?.([modifierSymbol(), "C"]);
        onCustomEntry();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onAddWater, onChangeGoal, onOpenSettings, onCustomEntry, onShortcutUsed]);
}
