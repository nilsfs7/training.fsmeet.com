import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { ensureSchema, getPool } from "@/lib/db";
import { feelingForStorage, feelingFromStored, isCategory, isFeelingScore, type Category, type FeelingScore, type Session } from "@/lib/types";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function sqlDateTime(iso: string): string {
  return new Date(iso).toISOString().slice(0, 23).replace("T", " ");
}

export class SessionInputError extends Error {}

export function parseSession(input: unknown): Session {
  if (!input || typeof input !== "object") throw new SessionInputError("Session is missing");
  const value = input as Record<string, unknown>;
  if (typeof value.id !== "string" || !UUID.test(value.id)) throw new SessionInputError("Session id is invalid");
  if (typeof value.trainedOn !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.trainedOn)) {
    throw new SessionInputError("Date is invalid");
  }
  const parsedDate = new Date(`${value.trainedOn}T00:00:00`);
  if (Number.isNaN(parsedDate.getTime())) throw new SessionInputError("Date is invalid");
  if (typeof value.durationMinutes !== "number" || !Number.isInteger(value.durationMinutes) || value.durationMinutes < 1 || value.durationMinutes > 1440) {
    throw new SessionInputError("Duration must be between 1 and 1440 minutes");
  }
  if (!Array.isArray(value.categories) || value.categories.length < 1) {
    throw new SessionInputError("Pick at least one category");
  }
  const categories: Category[] = [];
  for (const category of value.categories) {
    if (typeof category !== "string" || !isCategory(category) || categories.includes(category)) {
      throw new SessionInputError("Category is invalid");
    }
    categories.push(category);
  }
  let feeling: FeelingScore | null = null;
  if (value.feeling == null) {
    feeling = null;
  } else if (isFeelingScore(value.feeling)) {
    feeling = value.feeling;
  } else if (typeof value.feeling === "string") {
    const stored = feelingFromStored(value.feeling);
    if (stored == null) throw new SessionInputError("Feeling is invalid");
    feeling = stored;
  } else {
    throw new SessionInputError("Feeling is invalid");
  }
  let note: string | null = null;
  if (typeof value.note === "string") {
    const trimmed = value.note.trim();
    if (trimmed.length > 2000) throw new SessionInputError("Note is too long");
    note = trimmed.length > 0 ? trimmed : null;
  } else if (value.note != null) {
    throw new SessionInputError("Note is invalid");
  }
  const createdAt = typeof value.createdAt === "string" && !Number.isNaN(Date.parse(value.createdAt))
    ? new Date(value.createdAt).toISOString()
    : new Date().toISOString();
  return {
    id: value.id.toLowerCase(),
    trainedOn: value.trainedOn,
    durationMinutes: value.durationMinutes,
    categories,
    feeling,
    note,
    createdAt,
  };
}

type SessionRow = RowDataPacket & {
  id: string;
  trained_on: string;
  duration_minutes: number;
  feeling: string | null;
  note: string | null;
  created_at: string;
  category: string | null;
};

export async function listSessions(userId: string): Promise<Session[]> {
  await ensureSchema();
  const [rows] = await getPool().query<SessionRow[]>(
    `SELECT s.id, s.trained_on, s.duration_minutes, s.feeling, s.note, s.created_at, c.category
     FROM sessions s
     LEFT JOIN session_categories c ON c.session_id = s.id
     WHERE s.user_id = ?
     ORDER BY s.trained_on DESC, s.created_at DESC`,
    [userId],
  );
  const byId = new Map<string, Session>();
  for (const row of rows) {
    const existing = byId.get(row.id);
    const session = existing ?? {
      id: row.id,
      trainedOn: String(row.trained_on).slice(0, 10),
      durationMinutes: Number(row.duration_minutes),
      categories: [],
      feeling: feelingFromStored(row.feeling),
      note: row.note,
      createdAt: new Date(String(row.created_at).replace(" ", "T") + "Z").toISOString(),
    };
    if (row.category && isCategory(row.category) && !session.categories.includes(row.category)) {
      session.categories.push(row.category);
    }
    byId.set(row.id, session);
  }
  return [...byId.values()];
}

export async function deleteSessions(userId: string, ids: string[]): Promise<void> {
  if (ids.length < 1) throw new SessionInputError("Expected sessions");
  const unique = [...new Set(ids)];
  for (const id of unique) {
    if (!UUID.test(id)) throw new SessionInputError("Session id is invalid");
  }
  await ensureSchema();
  const placeholders = unique.map(() => "?").join(", ");
  await getPool().query(`DELETE FROM sessions WHERE user_id = ? AND id IN (${placeholders})`, [userId, ...unique.map((id) => id.toLowerCase())]);
}

export async function saveSessions(userId: string, sessions: Session[]): Promise<void> {
  await ensureSchema();
  const db = getPool();
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    for (const session of sessions) {
      const [existing] = await connection.query<RowDataPacket[]>(
        "SELECT user_id FROM sessions WHERE id = ? FOR UPDATE",
        [session.id],
      );
      if (existing.length > 0 && existing[0].user_id !== userId) {
        throw new SessionInputError("Session belongs to another athlete");
      }
      if (existing.length === 0) {
        await connection.query<ResultSetHeader>(
          `INSERT INTO sessions (id, user_id, trained_on, duration_minutes, feeling, note, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(3))`,
          [session.id, userId, session.trainedOn, session.durationMinutes, feelingForStorage(session.feeling), session.note, sqlDateTime(session.createdAt)],
        );
      } else {
        await connection.query(
          `UPDATE sessions
           SET trained_on = ?, duration_minutes = ?, feeling = ?, note = ?, updated_at = UTC_TIMESTAMP(3)
           WHERE id = ? AND user_id = ?`,
          [session.trainedOn, session.durationMinutes, feelingForStorage(session.feeling), session.note, session.id, userId],
        );
      }
      await connection.query("DELETE FROM session_categories WHERE session_id = ?", [session.id]);
      for (const category of session.categories) {
        await connection.query("INSERT INTO session_categories (session_id, category) VALUES (?, ?)", [session.id, category]);
      }
    }
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export async function upsertUser(input: { sub: string; name: string; email: string | null }): Promise<string> {
  await ensureSchema();
  const db = getPool();
  const [rows] = await db.query<RowDataPacket[]>("SELECT id FROM users WHERE fsmeet_sub = ?", [input.sub]);
  if (rows.length > 0) {
    await db.query("UPDATE users SET display_name = ?, email = ? WHERE id = ?", [input.name, input.email, rows[0].id]);
    return String(rows[0].id);
  }
  const id = crypto.randomUUID();
  await db.query(
    "INSERT INTO users (id, fsmeet_sub, email, display_name, created_at) VALUES (?, ?, ?, ?, UTC_TIMESTAMP(3))",
    [id, input.sub, input.email, input.name],
  );
  return id;
}
