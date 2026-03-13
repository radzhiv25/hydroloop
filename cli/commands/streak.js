import chalk from "chalk";
import { getStore } from "../utils/storage.js";

export function streakCommand(program) {
  program
    .command("streak")
    .description("Show your hydration streak")
    .action(() => {
      const store = getStore();
      const current = store.get("streak") ?? 0;
      const longest = store.get("longestStreak") ?? 0;

      console.log();
      console.log(
        `${chalk.red("🔥 Current Streak:")} ${chalk.bold(`${current} day${
          current === 1 ? "" : "s"
        }`)}`
      );
      console.log(
        `${chalk.yellow("🏆 Longest Streak:")} ${chalk.bold(`${longest} day${
          longest === 1 ? "" : "s"
        }`)}`
      );
      console.log();
    });
}

