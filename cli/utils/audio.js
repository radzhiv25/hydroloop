import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import playerFactory from "play-sound";
import { getStore } from "./storage.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const player = playerFactory({});

export const AVAILABLE_SOUNDS = [
  { id: "hydroloop_1", name: "Drop 1", file: "hydroloop_1.mp3" },
  { id: "hydroloop_2", name: "Drop 2", file: "hydroloop_2.mp3" },
  { id: "hydroloop_3", name: "Drop 3", file: "hydroloop_3.mp3" },
  { id: "hydroloop_4", name: "Drop 4", file: "hydroloop_4.mp3" },
  { id: "hydroloop_5", name: "Drop 5", file: "hydroloop_5.mp3" },
  { id: "hydroloop_goal", name: "Goal Reached", file: "hydroloop_goal.mp3" },
  { id: "hydroloop_goal_2", name: "Goal Reached 2", file: "hydroloop_goal_2.mp3" },
  { id: "hydroloop_special", name: "Special", file: "hydroloop_special.mp3" },
];

export function getSoundsDir() {
  return path.join(__dirname, "..", "sounds");
}

export function getSoundPath(soundId) {
  const sound = AVAILABLE_SOUNDS.find((s) => s.id === soundId);
  if (!sound) {
    return path.join(getSoundsDir(), "hydroloop_1.mp3");
  }
  return path.join(getSoundsDir(), sound.file);
}

export function getSelectedSound() {
  const store = getStore();
  return store.get("selectedSound") ?? "hydroloop_1";
}

export function setSelectedSound(soundId) {
  const store = getStore();
  const sound = AVAILABLE_SOUNDS.find((s) => s.id === soundId);
  if (!sound) {
    return false;
  }
  store.set("selectedSound", soundId);
  return true;
}

export function isSoundEnabled() {
  const store = getStore();
  return store.get("soundEnabled") ?? true;
}

export function setSoundEnabled(enabled) {
  const store = getStore();
  store.set("soundEnabled", enabled);
}

export function getSoundDuration() {
  const store = getStore();
  return store.get("soundDuration") ?? 5;
}

export function setSoundDuration(seconds) {
  const store = getStore();
  store.set("soundDuration", seconds);
}

export function playSound(soundId) {
  const soundPath = getSoundPath(soundId);

  return new Promise((resolve) => {
    if (!fs.existsSync(soundPath)) {
      process.stdout.write("\u0007");
      resolve();
      return;
    }

    player.play(soundPath, (err) => {
      if (err) {
        process.stdout.write("\u0007");
      }
      resolve();
    });
  });
}

export function playSoundLoop(soundId, durationSeconds = 5) {
  const soundPath = getSoundPath(soundId);

  return new Promise((resolve) => {
    if (!fs.existsSync(soundPath)) {
      process.stdout.write("\u0007");
      resolve();
      return;
    }

    let stopped = false;
    let currentProcess = null;

    const playOnce = () => {
      if (stopped) return;

      currentProcess = player.play(soundPath, (err) => {
        if (!stopped && !err) {
          playOnce();
        }
      });
    };

    playOnce();

    setTimeout(() => {
      stopped = true;
      if (currentProcess && typeof currentProcess.kill === "function") {
        currentProcess.kill();
      }
      resolve();
    }, durationSeconds * 1000);
  });
}

export function playReminderSound() {
  if (!isSoundEnabled()) {
    return Promise.resolve();
  }

  const selectedSound = getSelectedSound();
  return playSound(selectedSound);
}

