import { CATEGORIES, type Category, type Session } from "@/lib/types";

export type CategoryTotals = Record<Category, number>;

export type PeriodSummary = {
  totalMinutes: number;
  sessionCount: number;
  dayCount: number;
  byCategory: CategoryTotals;
};

function emptyCategories(): CategoryTotals {
  return {
    lowers: 0,
    uppers: 0,
    sitdown: 0,
    transitions: 0,
    acrobatics: 0,
  };
}

export function isoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setDate(date.getDate() + days);
  return isoDate(date);
}

export function weekRange(anchor: Date): { start: string; end: string } {
  const day = anchor.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const start = new Date(anchor);
  start.setHours(0, 0, 0, 0);
  start.setDate(anchor.getDate() + mondayOffset);
  return { start: isoDate(start), end: addDays(isoDate(start), 6) };
}

export function monthRange(anchor: Date): { start: string; end: string } {
  const start = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const end = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0);
  return { start: isoDate(start), end: isoDate(end) };
}

export function yearRange(anchor: Date): { start: string; end: string } {
  const year = anchor.getFullYear();
  return { start: `${year}-01-01`, end: `${year}-12-31` };
}

export function summarize(sessions: Session[], start: string, end: string): PeriodSummary {
  const byCategory = emptyCategories();
  const days = new Set<string>();
  let totalMinutes = 0;
  let sessionCount = 0;

  for (const session of sessions) {
    if (session.trainedOn < start || session.trainedOn > end) continue;
    sessionCount += 1;
    totalMinutes += session.durationMinutes;
    days.add(session.trainedOn);
    for (const category of session.categories) {
      byCategory[category] += session.durationMinutes;
    }
  }

  return {
    totalMinutes,
    sessionCount,
    dayCount: days.size,
    byCategory,
  };
}

export function topCategories(totals: CategoryTotals): Category[] {
  const top = Math.max(...CATEGORIES.map((category) => totals[category]));
  if (top <= 0) return [];
  return CATEGORIES.filter((category) => totals[category] === top);
}

export function shiftWeek(anchor: Date, weeks: number): Date {
  const next = new Date(anchor);
  next.setDate(anchor.getDate() + weeks * 7);
  return next;
}

export function shiftMonth(anchor: Date, months: number): Date {
  return new Date(anchor.getFullYear(), anchor.getMonth() + months, 1);
}

export function shiftYear(anchor: Date, years: number): Date {
  return new Date(anchor.getFullYear() + years, 0, 1);
}
