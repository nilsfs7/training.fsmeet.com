"use client";

import { useState } from "react";
import { addDays, isoDate, monthRange, parseIsoDate } from "@/lib/stats";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function monthCells(anchor: Date): Array<{ iso: string; inMonth: boolean }> {
  const { start, end } = monthRange(anchor);
  const lead = (parseIsoDate(start).getDay() + 6) % 7;
  const cells: Array<{ iso: string; inMonth: boolean }> = [];
  for (let index = lead; index > 0; index -= 1) cells.push({ iso: addDays(start, -index), inMonth: false });
  for (let iso = start; iso <= end; iso = addDays(iso, 1)) cells.push({ iso, inMonth: true });
  while (cells.length % 7 !== 0) cells.push({ iso: addDays(cells[cells.length - 1].iso, 1), inMonth: false });
  return cells;
}

export function MonthCalendar({
  value,
  onChange,
  rangeStart,
  rangeEnd,
  marked,
  nested = false,
}: {
  value: string;
  onChange: (iso: string) => void;
  rangeStart?: string;
  rangeEnd?: string;
  marked?: ReadonlySet<string>;
  nested?: boolean;
}) {
  const [visibleMonth, setVisibleMonth] = useState(() => parseIsoDate(value));
  const cells = monthCells(visibleMonth);
  const title = visibleMonth.toLocaleDateString("en", { month: "long", year: "numeric" });
  const today = isoDate(new Date());
  const bounds = rangeStart && rangeEnd && rangeStart <= rangeEnd ? { start: rangeStart, end: rangeEnd } : null;

  return (
    <section className={`card calendar-card${nested ? " nested" : ""}`}>
      <div className="month-switch">
        <button type="button" aria-label="Previous month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>
          <Chevron direction="left" />
        </button>
        <strong>{title}</strong>
        <button type="button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>
          <Chevron direction="right" />
        </button>
      </div>
      <div className="calendar" role="grid" aria-label={title}>
        {WEEKDAYS.map((day) => (
          <p className="weekday" key={day}>{day}</p>
        ))}
        {cells.map((cell) => {
          const isSelected = bounds ? cell.iso === bounds.start || cell.iso === bounds.end : cell.iso === value;
          const inRange = bounds ? cell.iso > bounds.start && cell.iso < bounds.end : false;
          const isToday = cell.iso === today;
          const hasSession = marked?.has(cell.iso) ?? false;
          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              aria-pressed={isSelected}
              aria-current={isToday ? "date" : undefined}
              aria-label={cell.iso}
              className={`day${cell.inMonth ? "" : " outside"}${isSelected ? " selected" : ""}${inRange ? " in-range" : ""}${hasSession ? " marked" : ""}${isToday ? " today" : ""}`}
              onClick={() => onChange(cell.iso)}
            >
              {Number(cell.iso.slice(-2))}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="icon">
      <path d={direction === "left" ? "M14.5 6.5 9 12l5.5 5.5" : "M9.5 6.5 15 12l-5.5 5.5"} />
    </svg>
  );
}
