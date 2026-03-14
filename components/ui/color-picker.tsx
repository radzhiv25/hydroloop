"use client";

import { useState } from "react";
import { HexColorPicker, HexColorInput } from "react-colorful";
import { cn } from "@/lib/utils";

type ColorPickerProps = {
  color: string;
  onChange: (hex: string) => void;
  className?: string;
};

export function ColorPicker({ color, onChange, className }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const displayColor = color.match(/^#[0-9A-Fa-f]{6}$/) ? color : "#94a3b8";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-8 w-8 shrink-0 cursor-pointer rounded-none border border-border shadow-sm transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        style={{ backgroundColor: displayColor }}
        aria-label="Pick color"
      />
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-full z-50 mt-2 rounded-none border border-border bg-popover p-3 shadow-lg">
            <HexColorPicker
              color={displayColor}
              onChange={onChange}
              className="!w-40 !h-40 rounded-none"
            />
            <HexColorInput
              color={displayColor}
              onChange={onChange}
              className="mt-2 w-full rounded-none border border-input bg-background px-2 py-1 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-ring"
              prefixed
            />
          </div>
        </>
      )}
    </div>
  );
}
