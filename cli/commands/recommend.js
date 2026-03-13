import readline from "node:readline";
import chalk from "chalk";
import { getStore, getTodayTotal } from "../utils/storage.js";

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

function parseWeight(input) {
  const trimmed = String(input).trim().toLowerCase();
  const numeric = Number.parseFloat(trimmed.replace("kg", ""));
  if (Number.isNaN(numeric) || numeric <= 0) return null;
  return numeric;
}

export function recommendCommand(program) {
  program
    .command("recommend")
    .description("Show a hydration recommendation based on your weight")
    .action(async () => {
      const store = getStore();
      let weightKg = store.get("weightKg");

      if (!weightKg) {
        const answer = await askQuestion(
          chalk.cyan("Enter your weight in kg (e.g. 70): ")
        );
        const parsed = parseWeight(answer);
        if (!parsed) {
          console.error(chalk.red("Invalid weight. Please provide a number in kg."));
          process.exitCode = 1;
          return;
        }
        weightKg = parsed;
        store.set("weightKg", weightKg);
      }

      const recommendedMl = Math.round(weightKg * 35);
      const recommendedL = (recommendedMl / 1000).toFixed(1);

      const todayTotal = getTodayTotal();
      const remaining = Math.max(0, recommendedMl - todayTotal);
      const remainingL = (remaining / 1000).toFixed(1);

      console.log();
      console.log(
        `${chalk.bold("Based on your weight:")} ${chalk.green(
          `${weightKg}kg`
        )}`
      );
      console.log(
        `${chalk.bold("Recommended intake:")} ${chalk.blue(
          `${recommendedL}L`
        )} (${recommendedMl}ml)`
      );
      console.log(
        `${chalk.bold("Remaining today:")} ${chalk.yellow(
          `${remaining}ml`
        )} (${remainingL}L)`
      );
      console.log();
    });
}

