"use client";

import { useMemo, useState } from "react";
import { CategoryChart } from "@/components/category-chart";
import { MonthCalendar } from "@/components/month-calendar";
import { useSessions } from "@/components/use-sessions";
import { isoDate, monthRange, parseIsoDate, shiftMonth, shiftWeek, shiftYear, summarize, weekRange, yearRange, type PeriodSummary } from "@/lib/stats";

type PeriodId = "week" | "month" | "year" | "custom";

const PERIODS: { id: PeriodId; label: string }[] = [
  { id: "week", label: "Week" },
  { id: "month", label: "Month" },
  { id: "year", label: "Year" },
  { id: "custom", label: "Custom" },
];

export function StatsView() {
  const { sessions, ready } = useSessions();
  const today = new Date();
  const currentMonth = monthRange(today);
  const [period, setPeriod] = useState<PeriodId>("week");
  const [customStart, setCustomStart] = useState(currentMonth.start);
  const [customEnd, setCustomEnd] = useState(isoDate(today));
  const [openDate, setOpenDate] = useState<"start" | "end" | null>(null);
  const marked = useMemo(() => new Set(sessions.map((session) => session.trainedOn)), [sessions]);
  const week = summarize(sessions, weekRange(today).start, weekRange(today).end);
  const month = summarize(sessions, currentMonth.start, currentMonth.end);
  const previousMonthAnchor = shiftMonth(today, -1);
  const previousMonth = summarize(
    sessions,
    monthRange(previousMonthAnchor).start,
    monthRange(previousMonthAnchor).end,
  );
  const previousWeek = summarize(sessions, weekRange(shiftWeek(today, -1)).start, weekRange(shiftWeek(today, -1)).end);
  const year = summarize(sessions, yearRange(today).start, yearRange(today).end);
  const previousYearAnchor = shiftYear(today, -1);
  const previousYear = summarize(sessions, yearRange(previousYearAnchor).start, yearRange(previousYearAnchor).end);
  const customReady = /^\d{4}-\d{2}-\d{2}$/.test(customStart) && /^\d{4}-\d{2}-\d{2}$/.test(customEnd) && customStart <= customEnd;
  const custom = customReady ? summarize(sessions, customStart, customEnd) : null;

  return (
    <>
      <h1>Statistics</h1>
      {ready ? (
        <>
          <div className="period-switch" role="group" aria-label="Period">
            {PERIODS.map((item) => (
              <button
                key={item.id}
                type="button"
                className="chip"
                aria-pressed={period === item.id}
                onClick={() => setPeriod(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {period === "week" ? (
            <Period label="This week" summary={week} comparison={comparison(week.totalMinutes, previousWeek.totalMinutes, "week")} />
          ) : null}
          {period === "month" ? (
            <Period label="This month" summary={month} comparison={comparison(month.totalMinutes, previousMonth.totalMinutes, "month")} />
          ) : null}
          {period === "year" ? (
            <Period label="This year" summary={year} comparison={comparison(year.totalMinutes, previousYear.totalMinutes, "year")} />
          ) : null}
          {period === "custom" ? (
            <section className="stat-block">
              <p className="eyebrow">Custom</p>
              <div className="stack">
                <DateField
                  label="From"
                  value={customStart}
                  open={openDate === "start"}
                  onToggle={() => setOpenDate(openDate === "start" ? null : "start")}
                  onChange={(iso) => {
                    setCustomStart(iso);
                    setOpenDate(null);
                  }}
                  rangeStart={customStart}
                  rangeEnd={customEnd}
                  marked={marked}
                />
                <DateField
                  label="To"
                  value={customEnd}
                  open={openDate === "end"}
                  onToggle={() => setOpenDate(openDate === "end" ? null : "end")}
                  onChange={(iso) => {
                    setCustomEnd(iso);
                    setOpenDate(null);
                  }}
                  rangeStart={customStart}
                  rangeEnd={customEnd}
                  marked={marked}
                />
              </div>
              {custom ? (
                <>
                  <p className="stat-number">{custom.totalMinutes}</p>
                  <p className="stat-unit">min</p>
                  <p className="meta">{sessionLabel(custom.sessionCount)}</p>
                  <CategoryChart totals={custom.byCategory} />
                </>
              ) : (
                <p className="error">Choose a start date that is on or before the end date.</p>
              )}
            </section>
          ) : null}
        </>
      ) : (
        <p className="meta">Loading sessions</p>
      )}
    </>
  );
}

function DateField({
  label,
  value,
  open,
  onToggle,
  onChange,
  rangeStart,
  rangeEnd,
  marked,
}: {
  label: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  onChange: (iso: string) => void;
  rangeStart: string;
  rangeEnd: string;
  marked: ReadonlySet<string>;
}) {
  const formatted = parseIsoDate(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <div className="date-field-block">
      <span>{label}</span>
      <button type="button" className="date-field" aria-expanded={open} aria-label={`${label}, ${formatted}`} onClick={onToggle}>
        <span>{formatted}</span>
        <CalendarIcon />
      </button>
      {open ? (
        <MonthCalendar nested value={value} onChange={onChange} rangeStart={rangeStart} rangeEnd={rangeEnd} marked={marked} />
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </svg>
  );
}

function Period({ label, summary, comparison: delta }: { label: string; summary: PeriodSummary; comparison: string }) {
  return (
    <section className="stat-block">
      <p className="eyebrow">{label}</p>
      <p className="stat-number">{summary.totalMinutes}</p>
      <p className="stat-unit">min</p>
      <p className="meta">{sessionLabel(summary.sessionCount)}</p>
      <p className="delta">{delta}</p>
      <CategoryChart totals={summary.byCategory} />
    </section>
  );
}

function sessionLabel(count: number): string {
  return count === 1 ? "1 session" : `${count} sessions`;
}

function comparison(current: number, previous: number, period: "week" | "month" | "year"): string {
  const delta = current - previous;
  if (delta === 0) return `Same minutes as last ${period}`;
  return `${Math.abs(delta)} min ${delta > 0 ? "more" : "less"} than last ${period}`;
}
