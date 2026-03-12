"use client";

import { useEffect, useRef, useCallback } from "react";
import type { UserData } from "@/lib/types";
import {
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_DURATION,
  REMINDER_SOUNDS,
  REMINDER_SOUND_CUSTOM,
} from "@/constants/hydration";

const POLL_MS = 60_000; // check every minute
const NOTIFICATION_TITLE = "Hydroloop";
const NOTIFICATION_BODY = "Time to take a sip! 💧";

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function getReminderSlotsMinutes(
  startMinutes: number,
  endMinutes: number,
  intervalMinutes: number
): number[] {
  const slots: number[] = [];
  for (let t = startMinutes; t <= endMinutes; t += intervalMinutes) {
    slots.push(t);
  }
  return slots;
}

function getNextReminderTime(
  slotsMinutes: number[],
  now: Date
): Date | null {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (const slot of slotsMinutes) {
    const slotDate = new Date(today);
    slotDate.setHours(Math.floor(slot / 60), slot % 60, 0, 0);
    if (slotDate.getTime() > now.getTime()) {
      return slotDate;
    }
  }
  // Next is tomorrow at first slot
  const first = slotsMinutes[0];
  if (first == null) return null;
  const next = new Date(today);
  next.setDate(next.getDate() + 1);
  next.setHours(Math.floor(first / 60), first % 60, 0, 0);
  return next;
}

function getSoundUrl(soundId: string, customSoundUrl?: string | null): string {
  if (soundId === REMINDER_SOUND_CUSTOM && customSoundUrl?.trim()) {
    return customSoundUrl.trim();
  }
  const id = REMINDER_SOUNDS.some((s) => s.id === soundId)
    ? soundId
    : DEFAULT_REMINDER_SOUND;
  return `/sounds/${id}.mp3`;
}

/** Play reminder sound for given duration (seconds), looping as needed, then stop. */
export function playReminderSoundForDuration(
  soundId: string,
  durationSeconds: number,
  customSoundUrl?: string | null
): () => void {
  const url = getSoundUrl(soundId, customSoundUrl);
  const audio = new Audio(url);
  audio.volume = 0.8;
  audio.loop = true;
  audio.play().catch(() => {});
  const stopAt = durationSeconds * 1000;
  const t = setTimeout(() => {
    audio.pause();
    audio.currentTime = 0;
  }, stopAt);
  return () => {
    clearTimeout(t);
    audio.pause();
    audio.currentTime = 0;
  };
}

export function useReminder(userData: UserData | null) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const nextRef = useRef<Date | null>(null);
  const permissionRef = useRef<NotificationPermission | null>(null);
  const dataRef = useRef(userData);
  dataRef.current = userData;

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (permissionRef.current != null) return permissionRef.current;
    const p = await Notification.requestPermission();
    permissionRef.current = p;
    return p;
  }, []);

  const fireReminder = useCallback(() => {
    const data = dataRef.current;
    if (!data) return;
    const soundId = data.reminder_sound ?? DEFAULT_REMINDER_SOUND;
    const customSoundUrl = soundId === REMINDER_SOUND_CUSTOM ? data.custom_sound_url : undefined;
    const duration =
      data.reminder_sound_duration_seconds ?? DEFAULT_REMINDER_SOUND_DURATION;

    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        const n = new Notification(NOTIFICATION_TITLE, {
          body: NOTIFICATION_BODY,
          icon: "/favicon.ico",
          tag: "hydroloop-reminder",
          requireInteraction: false,
        });
        n.onclick = () => {
          window.focus();
          n.close();
        };
      }
    }

    try {
      playReminderSoundForDuration(soundId, duration, customSoundUrl);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!userData) return;

    const start = parseTimeToMinutes(userData.time_span.start);
    const end = parseTimeToMinutes(userData.time_span.end);
    const interval = Math.max(1, userData.reminder_interval);
    const slots = getReminderSlotsMinutes(start, end, interval);
    if (slots.length === 0) return;

    requestPermission();

    const tick = () => {
      const now = new Date();
      const next = nextRef.current;
      if (next && now.getTime() >= next.getTime()) {
        fireReminder();
        nextRef.current = getNextReminderTime(slots, now);
      }
    };

    nextRef.current = getNextReminderTime(slots, new Date());
    tick();
    intervalRef.current = setInterval(tick, POLL_MS);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      nextRef.current = null;
    };
  }, [
    userData?.reminder_interval,
    userData?.time_span.start,
    userData?.time_span.end,
    userData?.reminder_sound,
    userData?.custom_sound_url,
    userData?.date,
    requestPermission,
    fireReminder,
  ]);

  return { requestPermission };
}
