export const CATEGORIES = [
  "lowers",
  "uppers",
  "sitdown",
  "acrobatics",
  "transitions",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Session = {
  id: string;
  trainedOn: string;
  durationMinutes: number;
  categories: Category[];
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
