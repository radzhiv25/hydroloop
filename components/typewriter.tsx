"use client";

import { useEffect, useRef, useState } from "react";
import { SPLASH } from "@/constants";

type TypewriterProps = {
  onComplete?: () => void;
};

export function Typewriter({ onComplete }: TypewriterProps) {
  const { line1, line2, charDelayMs, linePauseMs } = SPLASH;
  const [display1, setDisplay1] = useState("");
  const [display2, setDisplay2] = useState("");
  const [phase, setPhase] = useState<"line1" | "line2" | "done">("line1");

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
      onCompleteRef.current();
      onCompleteRef.current = undefined;
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
    </div>
  );
}
