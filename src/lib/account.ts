import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ensureSchema, getPool } from "@/lib/db";
import { defaultCategories, isDurationUnit, isFeelingInput, parseUserCategories, type DurationUnit, type FeelingInput, type UserCategory } from "@/lib/types";

export type AccountSettings = {
  feelingInput: FeelingInput;
  durationUnit: DurationUnit;
  categories: UserCategory[];
};

function categoriesFromStored(value: unknown): UserCategory[] {
  if (value == null || value === "") return defaultCategories();
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return parseUserCategories(parsed) ?? defaultCategories();
  } catch {
    return defaultCategories();
  }
}

export async function readAccountSettings(userId: string): Promise<AccountSettings> {
  await ensureSchema();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT feeling_input, duration_unit, categories FROM users WHERE id = ?",
    [userId],
  );
  const feeling = rows[0]?.feeling_input;
  const duration = rows[0]?.duration_unit;
  return {
    feelingInput: isFeelingInput(feeling) ? feeling : "emoji",
    durationUnit: isDurationUnit(duration) ? duration : "hours",
    categories: categoriesFromStored(rows[0]?.categories),
  };
}

export async function writeFeelingInput(userId: string, feelingInput: FeelingInput): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>("UPDATE users SET feeling_input = ? WHERE id = ?", [feelingInput, userId]);
  return result.affectedRows > 0;
}

export async function writeCategories(userId: string, categories: UserCategory[]): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>("UPDATE users SET categories = ? WHERE id = ?", [JSON.stringify(categories), userId]);
  return result.affectedRows > 0;
}

export async function writeDurationUnit(userId: string, durationUnit: DurationUnit): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>("UPDATE users SET duration_unit = ? WHERE id = ?", [durationUnit, userId]);
  return result.affectedRows > 0;
}
