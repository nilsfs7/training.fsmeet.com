import type { LocalSession, Session } from "@/lib/types";

const DB_NAME = "fs-training";
const STORE = "sessions";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function readLocalSessions(): Promise<LocalSession[]> {
  const db = await openDb();
  const rows = await requestToPromise(db.transaction(STORE, "readonly").objectStore(STORE).getAll());
  db.close();
  return (rows as LocalSession[]).sort((a, b) => {
    if (a.trainedOn !== b.trainedOn) return a.trainedOn < b.trainedOn ? 1 : -1;
    return a.createdAt < b.createdAt ? 1 : -1;
  });
}

export async function writeLocalSession(session: LocalSession): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORE, "readwrite").objectStore(STORE).put(session));
  db.close();
}

export async function removeLocalSession(id: string): Promise<void> {
  const db = await openDb();
  await requestToPromise(db.transaction(STORE, "readwrite").objectStore(STORE).delete(id));
  db.close();
}

export async function mergeRemoteSessions(remote: Session[]): Promise<void> {
  const local = await readLocalSessions();
  const pending = new Set(local.filter((session) => session.pending).map((session) => session.id));
  const db = await openDb();
  const transaction = db.transaction(STORE, "readwrite");
  const store = transaction.objectStore(STORE);
  for (const session of remote) {
    if (!pending.has(session.id)) store.put({ ...session, pending: false });
  }
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
