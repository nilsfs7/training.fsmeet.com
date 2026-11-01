"use client";

import { CategoryChart } from "@/components/category-chart";
import { useSessions } from "@/components/use-sessions";
import { shiftWeek, summarize, topCategories, weekRange } from "@/lib/stats";

export function HomeView() {
  const { sessions, pendingCount, ready } = useSessions();
  const today = new Date();
  const week = weekRange(today);
  const previous = weekRange(shiftWeek(today, -1));
  const current = summarize(sessions, week.start, week.end);
  const last = summarize(sessions, previous.start, previous.end);
  const delta = current.totalMinutes - last.totalMinutes;
  const leaders = topCategories(current.byCategory);

  return (
    <>
      <h1>This week</h1>
      <div className="stat-block">
        <p className="stat-number">{ready ? current.totalMinutes : ""}</p>
        <p className="stat-unit">min</p>
        {ready ? (
          <>
            <p className="meta">
              {current.sessionCount} {current.sessionCount === 1 ? "session" : "sessions"} · {current.dayCount}{" "}
              {current.dayCount === 1 ? "day" : "days"}
            </p>
            {last.totalMinutes > 0 || current.totalMinutes > 0 ? (
              <p className="delta">
                {delta === 0
                  ? "Same minutes as last week"
                  : `${Math.abs(delta)} min ${delta > 0 ? "more" : "less"} than last week`}
              </p>
            ) : null}
          </>
        ) : (
          <p className="meta">Loading sessions</p>
        )}
      </div>
      {ready && leaders.length > 0 ? <p className="meta">Most logged: {leaders.join(", ")}</p> : null}
      {ready ? (
        <section className="category-list" aria-label="Categories this week">
          <CategoryChart totals={current.byCategory} />
        </section>
      ) : null}
      {pendingCount > 0 ? (
        <p className="sync-note">
          {pendingCount === 1 ? "1 session is saved on this phone." : `${pendingCount} sessions are saved on this phone.`}{" "}
          Sync starts when you are back online.
        </p>
      ) : null}
      <a className="button" href="/log">
        Log Training
      </a>
    </>
  );
}
