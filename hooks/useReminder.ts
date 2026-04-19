"use client";

import { useEffect, useRef, useCallback } from "react";
import type { UserData } from "@/lib/types";
import {
  DEFAULT_REMINDER_SOUND,
  DEFAULT_REMINDER_SOUND_DURATION,
  REMINDER_SOUNDS,
  REMINDER_SOUND_CUSTOM,
} from "@/constants/hydration";
import { normalizeReminderDays } from "@/lib/reminder-weekdays";

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
  now: Date,
  allowedWeekdays: Set<number>
): Date | null {
  if (slotsMinutes.length === 0 || allowedWeekdays.size === 0) return null;

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  for (let addDays = 0; addDays < 8; addDays++) {
    const dayStart = new Date(startOfToday);
    dayStart.setDate(dayStart.getDate() + addDays);
    const wd = dayStart.getDay();
    if (!allowedWeekdays.has(wd)) continue;

    for (const slotMin of slotsMinutes) {
      const candidate = new Date(dayStart);
      candidate.setHours(Math.floor(slotMin / 60), slotMin % 60, 0, 0);
      if (candidate.getTime() > now.getTime()) {
        return candidate;
      }
    }
  }
  return null;
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

  useEffect(() => {
    dataRef.current = userData;
  }, [userData]);

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

    const allowed = new Set(normalizeReminderDays(userData.reminder_days));
    if (allowed.size === 0) return;

    requestPermission();

    const tick = () => {
      const now = new Date();
      const next = nextRef.current;
      if (next && now.getTime() >= next.getTime()) {
        fireReminder();
        nextRef.current = getNextReminderTime(slots, now, allowed);
      }
    };

    nextRef.current = getNextReminderTime(slots, new Date(), allowed);
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
    userData?.reminder_days,
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
