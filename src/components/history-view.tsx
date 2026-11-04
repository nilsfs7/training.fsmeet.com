"use client";

import { useMemo, useState } from "react";
import { categoryLabel } from "@/components/category-chart";
import { FeelingMark } from "@/components/feeling-face";
import { useCategories, useDurationUnit } from "@/components/feeling-input";
import { MonthCalendar } from "@/components/month-calendar";
import { useSessions } from "@/components/use-sessions";
import { durationSuffix, formatDuration, isoDate } from "@/lib/stats";

export function HistoryView() {
  const { sessions } = useSessions();
  const durationUnit = useDurationUnit();
  const categories = useCategories();
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
            <div className="session-heading">
              <strong>
                {formatDuration(session.durationMinutes, durationUnit)} {durationSuffix(durationUnit)}
              </strong>
              {session.feeling != null ? <FeelingMark feeling={session.feeling} /> : null}
            </div>
            <p>{categoryLabel(session.categories, categories)}</p>
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
