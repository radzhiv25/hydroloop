# Hydroloop

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/hydroloop.svg)](https://www.npmjs.com/package/hydroloop)

A developer-friendly hydration tracker. Stay hydrated while you code.

**Web App** | **CLI** | **Local-first**

## Overview

Hydroloop helps you build a consistent hydration habit with:

- **Web App** - Beautiful dashboard with charts, streaks, and keyboard shortcuts
- **CLI** - Terminal-based tracking with background reminders (`npm i -g hydroloop`)
- **Local Storage** - All data stays on your device, no account required

## Web App Features

- **Daily Goals** - Set and track your daily water target
- **Quick Add** - Log water, tea, coffee with one tap or keyboard shortcut
- **Charts** - Radial, bar, line, area, and radar views with customizable colors
- **Streaks** - Calendar view and streak stats to keep you consistent
- **Weekly Summary** - See your progress across the week
- **Keyboard First** - Full keyboard navigation (`⌘K` for shortcuts)
- **Dark Mode** - Easy on the eyes during late-night coding

## CLI Features

Install globally and track hydration from your terminal:

```bash
npm install -g hydroloop
```

```bash
hydroloop add 250        # Log 250ml
hydroloop status         # View progress
hydroloop start          # Start background reminders
hydroloop sound list     # Customize notification sounds
```

See the full [CLI documentation](./cli/README.md) for all commands.

## Quick Start

### Web App

From your local project directory:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### CLI

```bash
npm install -g hydroloop
hydroloop goal 2500
hydroloop add 250
hydroloop start
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com) |
| Components | [Radix UI](https://radix-ui.com), [shadcn/ui](https://ui.shadcn.com) |
| Charts | [Recharts](https://recharts.org) |
| Animation | [Motion](https://motion.dev) |
| CLI | Commander, Chalk |

## Project Structure

```
hydroloop/
├── app/                    # Next.js app router
├── components/
│   ├── ui/                 # Shadcn/UI primitives
│   ├── layout/             # Navbar, footer, shell
│   ├── landing/            # Landing page components
│   ├── dashboard/          # Dashboard components
│   └── shared/             # Shared components
├── screens/                # Page-level components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and types
├── cli/                    # CLI package (npm: hydroloop)
│   ├── commands/           # CLI commands
│   ├── utils/              # CLI utilities
│   └── sounds/             # Notification sounds
└── public/                 # Static assets
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘ K` | Open shortcuts dialog |
| `⌘ A` | Add water (250ml) |
| `⌘ C` | Custom water entry |
| `⌘ G` | Open logs & goal |
| `⌘ S` | Open settings |
| `⌘ ⇧ T` | Toggle dark mode |

*On Windows/Linux, use `Ctrl` instead of `⌘`*

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Development

This codebase is proprietary. Setup and workflow are for authorized contributors only.

### Local setup

```bash
npm install
npm run dev
```

```bash
# Run CLI locally
cd cli && npm link
hydroloop --help
```

## Mobile app (planned)

A native mobile experience is **not shipped yet**; it is on the roadmap so you know what to expect.

**For users**

- **Platforms** — The plan is iOS and Android via [React Native](https://reactnative.dev), so you get one consistent app on your phone, not just the website in a browser tab.
- **Same spirit as the web app** — Local-first storage, quick logging (water, tea, coffee), goals, streaks, and charts comparable to what you use on desktop—optimized for small screens and touch.
- **Why mobile matters** — Timely reminders and one-tap logging away from the keyboard, while your data stays oriented around privacy and device control (same philosophy as today’s web and CLI).
- **Timeline** — There is no public release date yet; updates will be announced when available.

**For contributors**

- Work may land on branches such as `feature/mobile` before a public app store listing; the README will be updated when install paths and repo layout for mobile are stable.

## Roadmap

- [ ] Mobile app (React Native) — see [Mobile app (planned)](#mobile-app-planned)
- [ ] Cloud sync with BaaS
- [ ] Apple Health / Google Fit integration
- [ ] Browser extension
- [ ] Slack/Discord bot

## Contributors

- radzhiv — creator & maintainer

## License

MIT - see [LICENSE](./LICENSE) for details.

## Links

- [CLI on npm](https://www.npmjs.com/package/hydroloop)

---

Built with hydration in mind.
