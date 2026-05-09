#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { addCommand } from "../commands/add.js";
import { statusCommand } from "../commands/status.js";
import { goalCommand } from "../commands/goal.js";
import { streakCommand } from "../commands/streak.js";
import { startCommand } from "../commands/start.js";
import { stopCommand } from "../commands/stop.js";
import { summaryCommand } from "../commands/summary.js";
import { recommendCommand } from "../commands/recommend.js";
import { soundCommand } from "../commands/sound.js";
import { reminderCommand } from "../commands/reminder.js";
import { authCommands } from "../commands/auth.js";
import { syncCommands } from "../commands/sync.js";
import { updateCommand } from "../commands/update.js";

const program = new Command();

program
  .name("hydroloop")
  .description("Hydroloop - a developer-friendly hydration tracker for the terminal")
  .version("0.1.7");

addCommand(program);
statusCommand(program);
goalCommand(program);
streakCommand(program);
startCommand(program);
stopCommand(program);
summaryCommand(program);
recommendCommand(program);
soundCommand(program);
reminderCommand(program);
authCommands(program);
syncCommands(program);
updateCommand(program);

program.addHelpText(
  "afterAll",
  `\n${chalk.cyan("Tips:")}\n  Use ${chalk.green(
    "hydroloop start"
  )} to enable background reminders while you work.\n` +
    `  ${chalk.cyan("Cloud (optional):")} ${chalk.green("hydroloop auth login --token <token>")}` +
    ` then ${chalk.green("hydroloop sync push")} — local logs queue offline-safe.\n`
);

program.parseAsync(process.argv);

