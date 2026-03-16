/**
 * Changelog entries for the web app and CLI.
 * Keep newest releases at the top of each array.
 */

export type ChangelogRelease = {
  version: string;
  date: string;
  items: string[];
};

export const webChangelog: ChangelogRelease[] = [
  {
    version: "1.1.0",
    date: "2026-03",
    items: [
      "Switched hydration data from localStorage to IndexedDB (Dexie).",
      "Splash screen state moved to IndexedDB; localStorage removed.",
      "Storage hooks updated for async persistence.",
      "Changelog page added with navbar and footer.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-03",
    items: [
      "Initial web app release: dashboard, streaks, weekly history, reminders, charts.",
    ],
  },
];

export const cliChangelog: ChangelogRelease[] = [
  {
    version: "0.1.3",
    date: "2026-03",
    items: [
      "CLI documentation page with terminal demo on the website.",
      "Package metadata and monorepo configuration updates.",
    ],
  },
  {
    version: "0.1.2",
    date: "2026-03",
    items: [
      "Reminder sounds support (play-sound).",
      "Config stored in ~/.config/hydroloop-nodejs via conf.",
      "Commands: sound list, reminder <minutes> for interval.",
    ],
  },
  {
    version: "0.1.1",
    date: "2026-03",
    items: [
      "Background reminders with node-notifier.",
      "Commands: start, stop for reminder daemon.",
      "Goal and streak commands: goal <ml>, streak.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-03",
    items: [
      "Initial CLI release (npm install -g hydroloop).",
      "Commands: add <amount>, status for today's progress.",
      "Data stored locally, separate from web app.",
    ],
  },
];
