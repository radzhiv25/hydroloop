"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { Kbd, KbdGroup } from "@/components/ui/kbd";

const HINT_DURATION_MS = 1500;

function isMac() {
  if (typeof navigator === "undefined") return true;
  return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
}

type ShortcutHintContextValue = {
  showHint: (keys: string[]) => void;
};

const ShortcutHintContext = createContext<ShortcutHintContextValue | null>(null);

export function useShortcutHint() {
  const ctx = useContext(ShortcutHintContext);
  return ctx ?? { showHint: () => {} };
}

export function ShortcutHintProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<string[] | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showHint = useCallback((newKeys: string[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setKeys(newKeys);
    timeoutRef.current = setTimeout(() => {
      setKeys(null);
      timeoutRef.current = null;
    }, HINT_DURATION_MS);
  }, []);

  return (
    <ShortcutHintContext.Provider value={{ showHint }}>
      {children}
      <ShortcutHintOverlay keys={keys} />
    </ShortcutHintContext.Provider>
  );
}

function ShortcutHintOverlay({ keys }: { keys: string[] | null }) {
  return (
    <AnimatePresence>
      {keys && keys.length > 0 && (
        <motion.div
          className="pointer-events-none fixed left-1/2 z-50 -translate-x-1/2"
          style={{ bottom: "25%" }}
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.96 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <div className="flex items-center gap-1.5 rounded-lg border border-border bg-background/95 px-2 py-1.5 shadow-lg backdrop-blur-sm">
            <KbdGroup className="gap-1.5">
              {keys.map((k, i) => {
                const isCommand = i === 0 && k === "⌘";
                const modifierSymbol = isCommand && !isMac() ? "⌃" : k;
                return (
                  <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <span className="text-muted-foreground text-sm">+</span>
                    )}
                    <Kbd className="text-sm">{modifierSymbol}</Kbd>
                  </span>
                );
              })}
            </KbdGroup>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
