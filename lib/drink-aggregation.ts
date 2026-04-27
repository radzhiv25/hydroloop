import { DRINK_TYPES } from "@/constants/hydration";
import type { WaterLogEntry } from "@/lib/types";

export type DrinkSegment = { id: string; name: string; value: number };

const KNOWN_ORDER = DRINK_TYPES.map((t) => t.id);
const KNOWN_SET = new Set<string>(KNOWN_ORDER);

/** Stable chart id + display label for a stored drinkType string. */
export function drinkSegmentForLog(drinkType: string | undefined): { id: string; name: string } {
  const raw = (drinkType ?? "water").trim() || "water";
  const lower = raw.toLowerCase();
  const known = DRINK_TYPES.find((d) => d.id === lower);
  if (known) return { id: known.id, name: known.label };
  const slug = raw
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "") || "custom";
  return { id: `custom_${slug}`, name: raw };
}

/** Aggregate log entries into ordered segments (known types first, then custom names A–Z). */
export function aggregateLogsToSegments(logs: WaterLogEntry[]): DrinkSegment[] {
  const map = new Map<string, { name: string; value: number }>();
  for (const log of logs) {
    const { id, name } = drinkSegmentForLog(log.drinkType);
    const prev = map.get(id);
    map.set(id, {
      name,
      value: (prev?.value ?? 0) + log.amount,
    });
  }

  const knownSegments: DrinkSegment[] = [];
  for (const id of KNOWN_ORDER) {
    const row = map.get(id);
    if (row && row.value > 0) {
      const t = DRINK_TYPES.find((d) => d.id === id)!;
      knownSegments.push({ id, name: t.label, value: row.value });
    }
  }

  const customIds = [...map.keys()].filter((id) => !KNOWN_SET.has(id));
  customIds.sort((a, b) => map.get(a)!.name.localeCompare(map.get(b)!.name, undefined, { sensitivity: "base" }));
  const customSegments = customIds.map((id) => ({
    id,
    name: map.get(id)!.name,
    value: map.get(id)!.value,
  }));

  const all = [...knownSegments, ...customSegments];
  if (all.length === 0) return [{ id: "water", name: "Water", value: 0 }];
  return all;
}

/** Flat map for persistence (weekly history). */
export function aggregateLogsToRecord(logs: WaterLogEntry[]): Record<string, number> {
  const segs = aggregateLogsToSegments(logs);
  return Object.fromEntries(segs.map((s) => [s.id, s.value]));
}

/** Union of segment ids that appear in any of the per-day maps (non-zero only). */
export function orderedDrinkSegmentIds(
  records: Array<Record<string, number> | undefined | null>
): string[] {
  const set = new Set<string>();
  for (const rec of records) {
    if (!rec) continue;
    for (const [k, v] of Object.entries(rec)) {
      if ((v ?? 0) > 0) set.add(k);
    }
  }
  const known = KNOWN_ORDER.filter((id) => set.has(id));
  const custom = [...set].filter((id) => !KNOWN_SET.has(id)).sort((a, b) => a.localeCompare(b));
  return [...known, ...custom];
}

/** Display label for a persisted segment id (custom_* is slugged from user text). */
export function labelForDrinkSegmentId(id: string): string {
  const known = DRINK_TYPES.find((d) => d.id === id);
  if (known) return known.label;
  if (id.startsWith("custom_")) {
    return id
      .slice("custom_".length)
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return id;
}

const FALLBACK_CUSTOM_FILLS = [
  "oklch(0.72 0.12 200)",
  "oklch(0.68 0.14 280)",
  "oklch(0.7 0.1 145)",
  "oklch(0.65 0.12 55)",
  "oklch(0.74 0.11 310)",
  "oklch(0.62 0.14 25)",
] as const;

/** Deterministic fill for segments not in the palette (custom drinks). */
export function colorForUnknownSegment(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  return FALLBACK_CUSTOM_FILLS[Math.abs(h) % FALLBACK_CUSTOM_FILLS.length];
}
