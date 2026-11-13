"use client";

import { CategoryChart } from "@/components/category-chart";
import { useCategories, useDurationUnit, useHomeDays } from "@/components/feeling-input";
import { useSessions } from "@/components/use-sessions";
import { addDays, durationSuffix, formatDuration, recentDaysRange, summarize, topCategories } from "@/lib/stats";
import { categoryName } from "@/lib/types";

export function HomeView() {
  const { sessions, pendingCount, ready } = useSessions();
  const durationUnit = useDurationUnit();
  const homeDays = useHomeDays();
  const categories = useCategories();
  const categoryIds = categories.map((category) => category.id);
  const today = new Date();
  const currentRange = recentDaysRange(today, homeDays);
  const previousRange = { start: addDays(currentRange.start, -homeDays), end: addDays(currentRange.start, -1) };
  const current = summarize(sessions, currentRange.start, currentRange.end, categoryIds);
  const last = summarize(sessions, previousRange.start, previousRange.end, categoryIds);
  const delta = current.totalMinutes - last.totalMinutes;
  const leaders = topCategories(current.byCategory, categoryIds).map((id) => categoryName(id, categories));

  return (
    <>
      <h1>Last {homeDays} days</h1>
      <div className="stat-block">
        <p className="stat-number">{ready ? formatDuration(current.totalMinutes, durationUnit) : ""}</p>
        <p className="stat-unit">{durationUnit}</p>
        {ready ? (
          <>
            <p className="meta">
              {current.sessionCount} {current.sessionCount === 1 ? "session" : "sessions"} · {current.dayCount}{" "}
              {current.dayCount === 1 ? "day" : "days"}
            </p>
            {last.totalMinutes > 0 || current.totalMinutes > 0 ? (
              <p className="delta">
                {delta === 0
                  ? `Same ${durationUnit} as the previous ${homeDays} days`
                  : `${formatDuration(Math.abs(delta), durationUnit)} ${durationSuffix(durationUnit)} ${delta > 0 ? "more" : "less"} than the previous ${homeDays} days`}
              </p>
            ) : null}
          </>
        ) : (
          <p className="meta">Loading sessions</p>
        )}
      </div>
      {ready && leaders.length > 0 ? <p className="meta">Most logged: {leaders.join(", ")}</p> : null}
      {ready ? (
        <section className="category-list" aria-label={`Categories over the last ${homeDays} days`}>
          <CategoryChart categories={categories} totals={current.byCategory} unit={durationUnit} />
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
