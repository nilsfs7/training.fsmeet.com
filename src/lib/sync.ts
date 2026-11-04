import { clearLocalSessions, mergeRemoteSessions, readLocalSessions, removeLocalSession, writeLocalSession } from "@/lib/idb";
import type { LocalSession, Session } from "@/lib/types";

const RESET_KEY = "fs-training-reset";

let flushQueue: Promise<void> = Promise.resolve();

function resetPending(): boolean {
  try {
    return localStorage.getItem(RESET_KEY) === "1";
  } catch {
    return false;
  }
}

function markReset(): void {
  try {
    localStorage.setItem(RESET_KEY, "1");
  } catch {
    // The server delete still runs while this page is open.
  }
}

function clearReset(): void {
  try {
    localStorage.removeItem(RESET_KEY);
  } catch {
    // The sessions are already gone on the server.
  }
}

async function deleteAllRemoteSessions(): Promise<boolean> {
  const response = await fetch("/api/sessions", {
    method: "DELETE",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ all: true }),
  });
  return response.ok;
}

export function flushSessions(): Promise<void> {
  const run = flushQueue.then(flushOnce);
  flushQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function flushOnce(): Promise<void> {
  if (!navigator.onLine) return;
  if (resetPending()) {
    if (!(await deleteAllRemoteSessions())) return;
    clearReset();
  }
  const local = await readLocalSessions();
  const pending = local.filter((session) => session.pending && !session.deleted);
  const deleted = local.filter((session) => session.deleted);
  if (pending.length > 0) {
    const response = await fetch("/api/sessions", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ sessions: pending }),
    });
    if (response.ok) {
      for (const session of pending) {
        await writeLocalSession({ ...session, pending: false });
      }
    }
  }
  let deleteAccepted = false;
  if (deleted.length > 0) {
    const response = await fetch("/api/sessions", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ids: deleted.map((session) => session.id) }),
    });
    deleteAccepted = response.ok;
  }

  const remote = await fetch("/api/sessions", { credentials: "same-origin" });
  if (!remote.ok) return;
  const body = (await remote.json()) as { sessions?: Session[] };
  if (!Array.isArray(body.sessions)) return;
  await mergeRemoteSessions(body.sessions);
  if (!deleteAccepted) return;
  const remoteIds = new Set(body.sessions.map((session) => session.id));
  for (const session of deleted) {
    if (!remoteIds.has(session.id)) await removeLocalSession(session.id);
  }
}

export function resetTraining(): Promise<void> {
  const run = flushQueue.then(resetOnce);
  flushQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

async function resetOnce(): Promise<void> {
  await clearLocalSessions();
  markReset();
  if (!navigator.onLine) return;
  if (!(await deleteAllRemoteSessions())) throw new Error("Could not delete training.");
  clearReset();
}

export async function deleteSession(session: LocalSession): Promise<void> {
  await writeLocalSession({ ...session, deleted: true, pending: true });
  try {
    await flushSessions();
  } catch {
    // The deletion stays on the phone and syncs on the next connection.
  }
}

export async function updateSession(session: LocalSession): Promise<void> {
  await writeLocalSession({ ...session, pending: true });
  try {
    await flushSessions();
  } catch {
    // The edit stays on the phone and syncs on the next connection.
  }
}

export async function captureSession(input: Omit<Session, "id" | "createdAt">): Promise<void> {
  const session: LocalSession = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    pending: true,
  };
  await writeLocalSession(session);
  try {
    await flushSessions();
  } catch {
    // The session stays on the phone and syncs on the next connection.
  }
}
