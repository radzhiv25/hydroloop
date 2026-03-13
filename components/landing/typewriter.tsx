"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SPLASH } from "@/constants";
import { Kbd, KbdGroup } from "@/components/ui/kbd";
import { usePlatform } from "@/hooks/usePlatform";

type TypewriterProps = {
  onComplete?: () => void;
};

export function Typewriter({ onComplete }: TypewriterProps) {
  const { line1, line2, charDelayMs, linePauseMs } = SPLASH;
  const [display1, setDisplay1] = useState("");
  const [display2, setDisplay2] = useState("");
  const [phase, setPhase] = useState<"line1" | "line2" | "done">("line1");
  const { modSymbol } = usePlatform();

  useEffect(() => {
    if (phase === "line1") {
      if (display1.length < line1.length) {
        const t = setTimeout(() => {
          setDisplay1(line1.slice(0, display1.length + 1));
        }, charDelayMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("line2"), linePauseMs);
      return () => clearTimeout(t);
    }

    if (phase === "line2") {
      if (display2.length < line2.length) {
        const t = setTimeout(() => {
          setDisplay2(line2.slice(0, display2.length + 1));
        }, charDelayMs);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("done"), linePauseMs);
      return () => clearTimeout(t);
    }

    return undefined;
  }, [display1, display2, phase, line1, line2, charDelayMs, linePauseMs]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  useEffect(() => {
    if (phase === "done" && onCompleteRef.current) {
      const t = setTimeout(() => {
        if (onCompleteRef.current) {
          onCompleteRef.current();
          onCompleteRef.current = undefined;
        }
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [phase]);

  return (
    <div className="text-center max-w-lg">
      <p className="text-2xl font-semibold text-foreground font-pixelify">
        {display1}
      </p>
      {(display2.length > 0 || phase !== "line1") && (
        <p className="mt-2 text-sm text-muted-foreground font-archivo">
          {display2}
        </p>
      )}
      <AnimatePresence>
        {phase === "done" && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="mt-6 flex items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <span>Press</span>
            <KbdGroup>
              <Kbd>{modSymbol}</Kbd>
              <Kbd>K</Kbd>
            </KbdGroup>
            <span>for shortcuts</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
