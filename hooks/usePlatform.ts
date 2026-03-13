import { useState, useEffect } from "react";

export function usePlatform() {
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
    }
  }, []);

  return {
    isMac,
    modKey: isMac ? "⌘" : "Ctrl",
    modSymbol: isMac ? "⌘" : "⌃",
  };
}

export function getModKey(): string {
  if (typeof navigator !== "undefined") {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl";
  }
  return "⌘";
}

export function getModSymbol(): string {
  if (typeof navigator !== "undefined") {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘" : "⌃";
  }
  return "⌘";
}
