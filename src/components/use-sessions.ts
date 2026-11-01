"use client";

import { useCallback, useEffect, useState } from "react";
import { readLocalSessions } from "@/lib/idb";
import { flushSessions } from "@/lib/sync";
import type { LocalSession } from "@/lib/types";

export function useSessions(): { sessions: LocalSession[]; pendingCount: number; ready: boolean } {
  const [sessions, setSessions] = useState<LocalSession[]>([]);
  const [ready, setReady] = useState(false);

  const reload = useCallback(async () => {
    const stored = await readLocalSessions();
    setSessions(stored.filter((session) => !session.deleted));
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      await reload();
      try {
        await flushSessions();
      } catch {
        // Keep showing what is already on the phone.
      }
      if (active) await reload();
    })();

    const onOnline = () => {
      flushSessions().then(() => reload()).catch(() => undefined);
    };
    window.addEventListener("online", onOnline);
    return () => {
      active = false;
      window.removeEventListener("online", onOnline);
    };
  }, [reload]);

  return {
    sessions,
    pendingCount: sessions.filter((session) => session.pending).length,
    ready,
  };
}
