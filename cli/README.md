# Hydroloop 💧

A developer-friendly hydration tracker for the terminal. Stay hydrated while you code.

```bash
npm install -g hydroloop
```

## Why Hydroloop?

- **Quick logging** — Log water in seconds without leaving the terminal
- **Background reminders** — Get notified to drink water at your preferred interval
- **Streak tracking** — Build consistency with daily streaks
- **Fully offline** — All data stored locally, no account needed
- **Customizable sounds** — Choose from 8 different notification sounds

## Quick Start

```bash
# Set your daily goal
hydroloop goal 2500

# Log water intake
hydroloop add 250

# Check your progress
hydroloop status

# Start background reminders
hydroloop start
```

## Commands

### Logging Water

```bash
# Log water (supports ml and L)
hydroloop add 250        # 250ml
hydroloop add 500ml      # 500ml
hydroloop add 1L         # 1000ml
hydroloop add 1.5L       # 1500ml
```

### Viewing Progress

```bash
# Today's status with progress bar
hydroloop status

# Daily summary report
hydroloop summary

# View streaks
hydroloop streak
```

**Example output:**

```
Hydration Status
----------------
Goal: 2500ml
Consumed: 1200ml
Remaining: 1300ml

Progress:
█████████░░░░░░░░░░░ 48%

Settings
--------
Reminder: every 30 minutes
Sound: Drop 2 (ON)
Service: Running ✓
```

### Setting Goals

```bash
# Set daily goal
hydroloop goal 3000

# Get personalized recommendation based on weight
hydroloop recommend
```

### Reminders

```bash
# Start background reminders (survives terminal close)
hydroloop start

# Stop reminders
hydroloop stop

# Set reminder interval (in minutes)
hydroloop reminder 30
```

When reminders are running, you'll get:
- Desktop notifications
- Sound alerts
- The service runs in the background until you stop it

### Sound Configuration

```bash
# List all available sounds
hydroloop sound list

# Set reminder sound
hydroloop sound set hydroloop_special

# Test a sound
hydroloop sound test
hydroloop sound test hydroloop_goal

# Set test duration (in seconds)
hydroloop sound duration 10

# Enable/disable sounds
hydroloop sound on
hydroloop sound off
```

**Available sounds:**
- `hydroloop_1` through `hydroloop_5` — Water drop variations
- `hydroloop_goal`, `hydroloop_goal_2` — Goal reached celebrations
- `hydroloop_special` — Special notification

## Data Storage

All data is stored locally:

| OS | Location |
|----|----------|
| macOS | `~/Library/Preferences/hydroloop-nodejs/config.json` |
| Linux | `~/.config/hydroloop-nodejs/config.json` |
| Windows | `%APPDATA%/hydroloop-nodejs/config.json` |

**Stored data:**
- Daily goal and logs
- Streak history
- Sound preferences
- Reminder interval
- Weight (for recommendations)

## Requirements

- Node.js 18+
- macOS, Linux, or Windows

### Platform Notes

**macOS (Apple Silicon)**

For desktop notifications, install:

```bash
brew install terminal-notifier
```

**Windows**

For sound playback, install one of these audio players and add to PATH:
- [mpg123](https://www.mpg123.de/download.shtml) (recommended)
- Or sounds will fall back to terminal bell

**Linux**

Most distros have audio players pre-installed (`aplay`, `mpg123`, etc.).

## Examples

### Morning routine

```bash
hydroloop goal 2500
hydroloop reminder 45
hydroloop start
```

### Quick check

```bash
hydroloop status
```

### End of day

```bash
hydroloop summary
hydroloop stop
```

## Troubleshooting

### Reminders not showing notifications?

On macOS Apple Silicon, install the native notifier:

```bash
brew install terminal-notifier
```

### No sound playing?

Make sure your system audio is working and sounds are enabled:

```bash
hydroloop sound on
hydroloop sound test
```

### Check if reminders are running

```bash
hydroloop status
# Look for: Service: Running ✓
```

## Links

- [GitHub Repository](https://github.com/radzhiv25/hydroloop)
- [Web App](https://hydroloop-seven.vercel.app)
- [Report Issues](https://github.com/radzhiv25/hydroloop/issues)
