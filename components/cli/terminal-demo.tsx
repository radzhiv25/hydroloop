"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { motion } from "motion/react";

type Line = {
  id: number;
  type: "command" | "output";
  text: string;
  delay?: number;
  playSound?: boolean;
};

let lineIdCounter = 0;

const DEMO_SEQUENCE: Omit<Line, "id">[] = [
  { type: "command", text: "hydroloop add 500", delay: 0 },
  { type: "output", text: "💧 Added 500ml", delay: 600 },
  { type: "output", text: "Today's total: 1500ml / 2500ml", delay: 100 },
  { type: "command", text: "hydroloop status", delay: 1200 },
  { type: "output", text: "", delay: 400 },
  { type: "output", text: "Hydration Status", delay: 100 },
  { type: "output", text: "────────────────", delay: 50 },
  { type: "output", text: "Goal:      2500ml", delay: 50 },
  { type: "output", text: "Consumed:  1500ml", delay: 50 },
  { type: "output", text: "Remaining:  1000ml", delay: 50 },
  { type: "output", text: "", delay: 50 },
  { type: "output", text: "Progress:", delay: 50 },
  { type: "output", text: "██████████████░░░░░░░░░░ 60%", delay: 100 },
  { type: "command", text: "hydroloop sound test", delay: 1500 },
  { type: "output", text: "🔊 Playing: Drop 1", delay: 400, playSound: true },
  { type: "output", text: "   Press Ctrl+C to stop", delay: 100 },
  { type: "command", text: "hydroloop streak", delay: 1500 },
  { type: "output", text: "🔥 Current Streak: 6 days", delay: 500 },
  { type: "output", text: "🏆 Longest Streak: 12 days", delay: 100 },
  { type: "command", text: "hydroloop start", delay: 1200 },
  { type: "output", text: "⚡ Hydroloop reminders started!", delay: 500 },
  { type: "output", text: "   Interval: every 45 minutes", delay: 100 },
];

export function TerminalDemo() {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback(() => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      // Ignore audio errors
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio("/sounds/hydroloop_1.mp3");
    audioRef.current.volume = 0.5;
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    const timeouts: NodeJS.Timeout[] = [];

    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(resolve, ms);
        timeouts.push(t);
      });

    const runSequence = async () => {
      lineIdCounter = 0;
      setLines([]);
      setCurrentCommand("");
      setShowCursor(false);

      for (const lineData of DEMO_SEQUENCE) {
        if (!mounted) return;

        await delay(lineData.delay || 0);
        if (!mounted) return;

        if (lineData.type === "command") {
          setShowCursor(true);
          setCurrentCommand("");

          // Type out the command character by character
          for (let j = 0; j <= lineData.text.length; j++) {
            if (!mounted) return;
            setCurrentCommand(lineData.text.slice(0, j));
            await delay(35);
          }

          await delay(250);
          if (!mounted) return;

          // Add the completed command to lines
          const newLine: Line = { ...lineData, id: lineIdCounter++ };
          setLines((prev) => [...prev, newLine]);
          setCurrentCommand("");
          setShowCursor(false);
        } else {
          const newLine: Line = { ...lineData, id: lineIdCounter++ };
          if (lineData.playSound) {
            playSound();
          }
          setLines((prev) => [...prev, newLine]);
        }

        // Scroll to bottom
        requestAnimationFrame(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        });
      }

      await delay(3500);
      if (mounted) {
        runSequence();
      }
    };

    runSequence();

    return () => {
      mounted = false;
      timeouts.forEach(clearTimeout);
    };
  }, [playSound]);

  return (
    <div className="overflow-hidden rounded-none border border-border bg-zinc-950">
      <div className="flex items-center gap-1.5 border-b border-zinc-800 px-2.5 py-1.5 sm:px-3 sm:py-2">
        <div className="h-2 w-2 rounded-full bg-red-500/80 sm:h-2.5 sm:w-2.5" />
        <div className="h-2 w-2 rounded-full bg-yellow-500/80 sm:h-2.5 sm:w-2.5" />
        <div className="h-2 w-2 rounded-full bg-green-500/80 sm:h-2.5 sm:w-2.5" />
        <span className="ml-2 text-[10px] text-zinc-500 sm:text-xs">Terminal</span>
      </div>
      <div
        ref={containerRef}
        className="h-[280px] overflow-y-auto p-3 font-mono text-xs leading-relaxed sm:h-[340px] sm:p-4 sm:text-sm"
      >
        {lines.map((line) => (
          <div
            key={line.id}
            className={line.type === "command" ? "text-green-400" : "text-zinc-300"}
          >
            {line.type === "command" ? (
              <>
                <span className="text-blue-400">❯</span> {line.text}
              </>
            ) : (
              <span className="whitespace-pre">{line.text}</span>
            )}
          </div>
        ))}

        {showCursor && (
          <div className="text-green-400">
            <span className="text-blue-400">❯</span> {currentCommand}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
              className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 bg-green-400 sm:h-4"
            />
          </div>
        )}
      </div>
    </div>
  );
}
