"use client";

import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "motion/react";
import { useShortcutHint } from "@/components/dashboard/shortcut-hint/shortcut-hint";
import { usePlatform } from "@/hooks/usePlatform";

const getShortcuts = (mod: string) => [
  { keys: [mod, "K"], label: "Open this dialog" },
  { keys: [mod, "A"], label: "Add water (250 ml)" },
  { keys: [mod, "G"], label: "Open logs & goal drawer" },
  { keys: [mod, "S"], label: "Open settings drawer" },
  { keys: [mod, "C"], label: "Custom water entry" },
  { keys: [mod, "⇧", "T"], label: "Toggle light / dark mode" },
  { keys: [mod, "⇧", "G"], label: "Open GitHub repository" },
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);
  const { showHint } = useShortcutHint();
  const { modSymbol } = usePlatform();
  const shortcuts = getShortcuts(modSymbol);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        showHint([modSymbol, "K"]);
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showHint, modSymbol]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="flex items-center gap-1.5">
          Keyboard shortcuts <Kbd>{modSymbol}</Kbd>
          <Kbd>K</Kbd>
        </TooltipContent>
      </Tooltip>
      <DialogContent showCloseButton className="sm:max-w-xs">
        <DialogHeader>
          <DialogTitle className="text-sm">Keyboard shortcuts</DialogTitle>
        </DialogHeader>
        <ul className="flex flex-col gap-2 py-1">
          <AnimatePresence>
            {shortcuts.map((item, i) => (
              <motion.li
                key={item.label}
                className="flex items-center justify-between gap-3 text-xs"
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
              >
                <span className="text-muted-foreground">{item.label}</span>
                <KbdGroup className="shrink-0">
                  {item.keys.map((k, j) => (
                    <Kbd key={j}>{k}</Kbd>
                  ))}
                </KbdGroup>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </DialogContent>
    </Dialog>
  );
}
