"use client";

import { MonthCalendar } from "@/components/month-calendar";
import { parseIsoDate } from "@/lib/stats";

export function DateField({
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
  rangeStart?: string;
  rangeEnd?: string;
  marked?: ReadonlySet<string>;
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
