import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ensureSchema, getPool } from "@/lib/db";
import { isDurationUnit, isFeelingInput, type DurationUnit, type FeelingInput } from "@/lib/types";

export type AccountSettings = {
  feelingInput: FeelingInput;
  durationUnit: DurationUnit;
};

export async function readAccountSettings(userId: string): Promise<AccountSettings> {
  await ensureSchema();
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT feeling_input, duration_unit FROM users WHERE id = ?",
    [userId],
  );
  const feeling = rows[0]?.feeling_input;
  const duration = rows[0]?.duration_unit;
  return {
    feelingInput: isFeelingInput(feeling) ? feeling : "emoji",
    durationUnit: isDurationUnit(duration) ? duration : "hours",
  };
}

export async function writeFeelingInput(userId: string, feelingInput: FeelingInput): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>("UPDATE users SET feeling_input = ? WHERE id = ?", [feelingInput, userId]);
  return result.affectedRows > 0;
}

export async function writeDurationUnit(userId: string, durationUnit: DurationUnit): Promise<boolean> {
  await ensureSchema();
  const [result] = await getPool().query<ResultSetHeader>("UPDATE users SET duration_unit = ? WHERE id = ?", [durationUnit, userId]);
  return result.affectedRows > 0;
}
