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

const program = new Command();

program
  .name("hydroloop")
  .description("Hydroloop - a developer-friendly hydration tracker for the terminal")
  .version("0.1.0");

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

program.addHelpText(
  "afterAll",
  `\n${chalk.cyan("Tips:")}\n  Use ${chalk.green(
    "hydroloop start"
  )} to enable background reminders while you work.\n`
);

program.parseAsync(process.argv);

