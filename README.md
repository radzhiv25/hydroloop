# Hydroloop

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/hydroloop.svg)](https://www.npmjs.com/package/hydroloop)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

A developer-friendly hydration tracker. Stay hydrated while you code.

**Web App** | **CLI** | **Local-first** | **Open Source**

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

```bash
git clone https://github.com/radzhiv25/hydroloop.git
cd hydroloop
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
| CLI | [Commander](https://github.com/tj/commander.js), [Chalk](https://github.com/chalk/chalk) |

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
| `⌘ ⇧ G` | Open GitHub |

*On Windows/Linux, use `Ctrl` instead of `⌘`*

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Run production server |
| `npm run lint` | Run ESLint |

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feat/amazing-feature`)
3. **Commit** your changes using [conventional commits](https://www.conventionalcommits.org/)
   - `feat:` New features
   - `fix:` Bug fixes
   - `docs:` Documentation
   - `style:` Formatting
   - `refactor:` Code restructuring
   - `chore:` Maintenance
4. **Push** to your branch (`git push origin feat/amazing-feature`)
5. **Open** a Pull Request

### Development Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/hydroloop.git
cd hydroloop

# Install dependencies
npm install

# Start dev server
npm run dev

# Run CLI locally
cd cli && npm link
hydroloop --help
```

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Cloud sync with BaaS
- [ ] Apple Health / Google Fit integration
- [ ] Browser extension
- [ ] Slack/Discord bot

## License

MIT - see [LICENSE](./LICENSE) for details.

## Links

- [GitHub Repository](https://github.com/radzhiv25/hydroloop)
- [CLI on npm](https://www.npmjs.com/package/hydroloop)
- [Report Issues](https://github.com/radzhiv25/hydroloop/issues)

---

Built with hydration in mind.
