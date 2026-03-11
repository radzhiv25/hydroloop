# Hydroloop

A minimal, open-source water reminder app. Track daily intake, set goals, and build a hydration habit.

## Features

- **Daily goal** – Set and adjust your daily water target (ml)
- **Quick add** – Log water, tea, coffee, or custom drinks with one tap
- **Charts** – Radial (stacked), bar, line, area, and radar views with color palettes
- **Streaks** – Calendar and streak stats to keep you consistent
- **Weekly summary** – Progress toward goal by day (M–S)
- **Keyboard shortcuts** – ⌘K (shortcuts), A / G / S / C for add, logs, settings, custom
- **Settings** – Profile, reminder window, graph type, color palette, clear all data

Data is stored locally in the browser (no account required).

## Tech stack

- [Next.js](https://nextjs.org) (App Router)
- [React](https://react.dev) 19
- [Tailwind CSS](https://tailwindcss.com) v4
- [Recharts](https://recharts.org) for charts
- [Radix UI](https://radix-ui.com) primitives
- [Motion](https://motion.dev) for animation
- [Zod](https://zod.dev) + [React Hook Form](https://react-hook-form.com) for settings

## Prerequisites

- Node.js 20+
- npm, yarn, pnpm, or bun

## Installation

```bash
git clone https://github.com/your-username/water-reminder.git
cd water-reminder
npm install
```

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server (3000)  |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | Run ESLint               |

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes, or a PR for small fixes and features.

1. Fork the repo
2. Create a branch (`git checkout -b feat/your-feature`)
3. Commit with conventional messages (`feat:`, `fix:`, `docs:`, `chore:`, `style:`)
4. Push and open a Pull Request

## License

MIT
