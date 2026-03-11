export const PRODUCT_NAME = "Hydroloop";

export const SPLASH = {
  line1: "Welcome to Hydroloop",
  line2: "as every hydration matters to rejuvenate the inner you",
  charDelayMs: 42,
  linePauseMs: 280,
} as const;

export const SPLASH_STORAGE_KEY = "hydroloop_last_splash_at";
export const SPLASH_INTERVAL_MS = 24 * 60 * 60 * 1000; // 1 day

/** Set to true to always show splash (e.g. for screenshot). No redirect to main. */
export const SPLASH_SCREENSHOT_MODE = false;
