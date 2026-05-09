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
    version: "1.2.0",
    date: "2026-05",
    items: [
      "Added: Supabase authentication (email/password and Google) with /auth and SSR-aware browser client.",
      "Added: middleware and client AuthGate so /app requires a signed-in session.",
      "Added: optional Settings flow to migrate local IndexedDB hydration data to Supabase with progress feedback.",
      "Added: Logout in Settings; signup weight field with recommended daily intake and local goal seeding.",
      "Updated: auth screen layout (corner accents, primary buttons with arrow affordance).",
    ],
  },
  {
    version: "1.1.2",
    date: "2026-04",
    items: [
      "Added: shared drink aggregation for built-in and custom drink types across dashboard charts.",
      "Added: per-drink weekly snapshot data and persistent detailed log history by date.",
      "Added: custom daily goal mode in Settings with 100ml slider steps up to 5000ml.",
      "Added: custom drink presets in Settings, surfaced as quick-add tabs in the dashboard.",
      "Added: custom 404 page with hydration-themed copy and quick actions back to home/app.",
      "Updated: weekly summary to combine stacked drink composition with goal-reach tiers.",
      "Updated: reminder sound selections and duration to persist live from Settings.",
      "Updated: landing navigation now includes a direct Changelog link for easier discovery.",
      "Changed: weekly goal chip labels now use actual dates to avoid day mismatches.",
      "Changed: dashboard quick-add tab ordering to show custom presets before the Other tab.",
      "Changed: theme toggle moved to the far right in navbar actions.",
    ],
  },
  {
    version: "1.1.1",
    date: "2026-04",
    items: [
      "Added: weekday-based reminder scheduling with selectable reminder days.",
      "Updated: measured-bottle guidance text across splash and settings copy.",
      "Changed: removed GitHub references from app and package metadata.",
    ],
  },
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
    version: "0.1.6",
    date: "2026-05",
    items: [
      "Fixed: package.json bin path for npm 11+ validators (relative path without `./` — avoids bin being stripped at publish time).",
    ],
  },
  {
    version: "0.1.5",
    date: "2026-05",
    items: [
      "Added: auth commands (login, logout, whoami) for optional Supabase email/password sign-in.",
      "Added: sync commands (push, status, enqueue-legacy) for offline-first upload to hydration_logs (source: cli).",
      "Added: pending outbound queue and idempotent upserts (client_event_id) so cloud rows are not overwritten.",
      "Changed: local config defaults to ~/.config/hydroloop (override with HYDROLOOP_CONFIG_DIR).",
      "Updated: add supports -t / --type for drink_type on cloud rows; attempts sync after each add when signed in.",
    ],
  },
  {
    version: "0.1.4",
    date: "2026-04",
    items: [
      "Updated: package version bumped to 0.1.4 for latest release alignment.",
      "Updated: CLI README documentation refreshed with current release wording.",
    ],
  },
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
