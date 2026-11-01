"use client";

import { useMemo, useState } from "react";
import { categoryLabel } from "@/components/category-chart";
import { MonthCalendar } from "@/components/month-calendar";
import { useSessions } from "@/components/use-sessions";
import { isoDate } from "@/lib/stats";

export function HistoryView() {
  const { sessions } = useSessions();
  const [selected, setSelected] = useState(() => isoDate(new Date()));
  const marked = useMemo(() => new Set(sessions.map((session) => session.trainedOn)), [sessions]);
  const daySessions = sessions.filter((session) => session.trainedOn === selected);

  return (
    <>
      <h1>History</h1>
      <MonthCalendar value={selected} onChange={setSelected} marked={marked} />
      <div className="session-list">
        {daySessions.length === 0 ? <p className="meta">No session on this day.</p> : null}
        {daySessions.map((session) => (
          <article className="card session-card" key={session.id}>
            <strong>{session.durationMinutes} min</strong>
            <p>{categoryLabel(session.categories)}</p>
            {session.note ? <p>{session.note}</p> : null}
            {session.pending ? <p>Saved on this phone</p> : null}
            <a className="edit-link" href={`/edit/${session.id}`}>
              Edit
            </a>
          </article>
        ))}
      </div>
    </>
  );
}
