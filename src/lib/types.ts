export const CATEGORIES = [
  "lowers",
  "uppers",
  "sitdown",
  "acrobatics",
  "transitions",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const FEELING_SCORES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type FeelingScore = (typeof FEELING_SCORES)[number];

export const FEELING_LEVELS = [1, 3, 5, 8, 10] as const;

export type FeelingLevel = (typeof FEELING_LEVELS)[number];

export const FEELING_INPUTS = ["emoji", "score"] as const;

export type FeelingInput = (typeof FEELING_INPUTS)[number];

export const DURATION_UNITS = ["hours", "minutes"] as const;

export type DurationUnit = (typeof DURATION_UNITS)[number];

export type Session = {
  id: string;
  trainedOn: string;
  durationMinutes: number;
  categories: Category[];
  feeling: FeelingScore | null;
  note: string | null;
  createdAt: string;
};

export type LocalSession = Session & {
  pending: boolean;
  deleted?: boolean;
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

const LEGACY_FEELINGS: Record<string, FeelingLevel> = {
  rough: 1,
  hard: 3,
  okay: 5,
  good: 8,
  great: 10,
};

export function isFeelingScore(value: unknown): value is FeelingScore {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 10;
}

export function isFeelingLevel(value: FeelingScore): value is FeelingLevel {
  return (FEELING_LEVELS as readonly number[]).includes(value);
}

export function isFeelingInput(value: unknown): value is FeelingInput {
  return value === "emoji" || value === "score";
}

export function isDurationUnit(value: unknown): value is DurationUnit {
  return value === "hours" || value === "minutes";
}

export function feelingFromStored(value: string | null): FeelingScore | null {
  if (!value) return null;
  const legacy = LEGACY_FEELINGS[value];
  if (legacy) return legacy;
  const score = Number(value);
  if (isFeelingScore(score) && String(score) === value) return score;
  return null;
}

export function feelingForStorage(feeling: FeelingScore | null): string | null {
  return feeling == null ? null : String(feeling);
}
