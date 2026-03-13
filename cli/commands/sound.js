import chalk from "chalk";
import {
  AVAILABLE_SOUNDS,
  getSelectedSound,
  setSelectedSound,
  playSoundLoop,
  isSoundEnabled,
  setSoundEnabled,
  getSoundDuration,
  setSoundDuration,
} from "../utils/audio.js";

export function soundCommand(program) {
  const sound = program
    .command("sound")
    .description("Manage reminder sounds");

  sound
    .command("list")
    .description("List available sounds")
    .action(() => {
      const selected = getSelectedSound();
      const enabled = isSoundEnabled();
      const duration = getSoundDuration();

      console.log(chalk.bold("\nAvailable Sounds\n"));

      for (const s of AVAILABLE_SOUNDS) {
        const isSelected = s.id === selected;
        const marker = isSelected ? chalk.green("● ") : "  ";
        const name = isSelected ? chalk.green(s.name) : s.name;
        const id = chalk.dim(`(${s.id})`);
        console.log(`${marker}${name} ${id}`);
      }

      console.log();
      console.log(
        `${chalk.bold("Sound:")} ${enabled ? chalk.green("ON") : chalk.red("OFF")}`
      );
      console.log(`${chalk.bold("Test duration:")} ${duration} seconds`);
      console.log(
        chalk.dim(`\nUse ${chalk.white("hydroloop sound set <id>")} to change sound`)
      );
      console.log(
        chalk.dim(`Use ${chalk.white("hydroloop sound duration <seconds>")} to set test duration`)
      );
      console.log();
    });

  sound
    .command("set <id>")
    .description("Set the reminder sound")
    .action((id) => {
      const success = setSelectedSound(id);

      if (success) {
        const sound = AVAILABLE_SOUNDS.find((s) => s.id === id);
        console.log(
          `${chalk.green("✓")} Sound set to ${chalk.cyan(sound.name)}`
        );
      } else {
        console.error(chalk.red(`Unknown sound: ${id}`));
        console.log(
          chalk.dim(`Use ${chalk.white("hydroloop sound list")} to see available sounds`)
        );
        process.exitCode = 1;
      }
    });

  sound
    .command("test [id]")
    .description("Preview a sound in a loop")
    .option("-d, --duration <seconds>", "How long to play the sound (overrides saved duration)")
    .action(async (id, options) => {
      const soundId = id ?? getSelectedSound();
      const soundInfo = AVAILABLE_SOUNDS.find((s) => s.id === soundId);

      if (!soundInfo) {
        console.error(chalk.red(`Unknown sound: ${soundId}`));
        process.exitCode = 1;
        return;
      }

      const savedDuration = getSoundDuration();
      const duration = options.duration
        ? Number.parseInt(options.duration, 10)
        : savedDuration;

      if (Number.isNaN(duration) || duration < 1) {
        console.error(chalk.red("Duration must be a positive number of seconds."));
        process.exitCode = 1;
        return;
      }

      console.log(
        `${chalk.cyan("🔊")} Playing ${chalk.bold(soundInfo.name)} for ${duration} seconds...`
      );
      console.log(chalk.dim("Press Ctrl+C to stop early.\n"));

      await playSoundLoop(soundId, duration);

      console.log(chalk.green("✓ Done"));
    });

  sound
    .command("duration <seconds>")
    .description("Set the default test duration in seconds")
    .action((seconds) => {
      const duration = Number.parseInt(seconds, 10);

      if (Number.isNaN(duration) || duration < 1) {
        console.error(chalk.red("Duration must be a positive number of seconds."));
        process.exitCode = 1;
        return;
      }

      if (duration > 60) {
        console.log(
          chalk.yellow("⚠️  That's a long duration! Consider something shorter.")
        );
      }

      setSoundDuration(duration);
      console.log(
        `${chalk.green("✓")} Test duration set to ${chalk.cyan(`${duration} seconds`)}`
      );
    });

  sound
    .command("on")
    .description("Enable reminder sounds")
    .action(() => {
      setSoundEnabled(true);
      console.log(`${chalk.green("✓")} Reminder sounds ${chalk.green("enabled")}`);
    });

  sound
    .command("off")
    .description("Disable reminder sounds (silent mode)")
    .action(() => {
      setSoundEnabled(false);
      console.log(`${chalk.green("✓")} Reminder sounds ${chalk.red("disabled")}`);
    });
}
