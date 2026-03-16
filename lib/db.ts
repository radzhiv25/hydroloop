import Dexie, { Table } from "dexie";

type KVRecord = {
  key: string;
  value: string;
};

class AppDatabase extends Dexie {
  kv!: Table<KVRecord, string>;

  constructor() {
    super("hydroloop");

    this.version(1).stores({
      kv: "&key",
    });
  }
}

const db = new AppDatabase();

export async function kvGet(key: string): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const row = await db.kv.get(key);
    return row?.value ?? null;
  } catch {
    return null;
  }
}

export async function kvSet(key: string, value: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await db.kv.put({ key, value });
  } catch {
    // ignore
  }
}

export async function kvRemove(key: string): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await db.kv.delete(key);
  } catch {
    // ignore
  }
}

