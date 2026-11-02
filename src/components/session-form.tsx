"use client";

import { useMemo, useState } from "react";
import { DateField } from "@/components/date-field";
import { useSessions } from "@/components/use-sessions";
import { isoDate } from "@/lib/stats";
import { CATEGORIES, type Category, type Session } from "@/lib/types";

const PRESETS = [15, 30, 45, 60, 90, 120];

export function SessionForm({
  title,
  submitLabel,
  initial,
  onSave,
}: {
  title: string;
  submitLabel: string;
  initial?: Pick<Session, "trainedOn" | "durationMinutes" | "categories" | "note">;
  onSave: (input: Omit<Session, "id" | "createdAt">) => Promise<void>;
}) {
  const [trainedOn, setTrainedOn] = useState(() => initial?.trainedOn ?? isoDate(new Date()));
  const [duration, setDuration] = useState(() => (initial ? String(initial.durationMinutes) : ""));
  const [categories, setCategories] = useState<Category[]>(() => initial?.categories ?? []);
  const [note, setNote] = useState(() => initial?.note ?? "");
  const [dateOpen, setDateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { sessions } = useSessions();
  const marked = useMemo(() => new Set(sessions.map((session) => session.trainedOn)), [sessions]);
  const durationMinutes = Number(duration);
  const ready = Number.isInteger(durationMinutes) && durationMinutes >= 1 && durationMinutes <= 1440 && categories.length > 0;

  function toggle(category: Category) {
    setCategories((current) =>
      current.includes(category) ? current.filter((item) => item !== category) : [...current, category],
    );
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready || saving) return;
    setSaving(true);
    setError(null);
    try {
      await onSave({
        trainedOn,
        durationMinutes,
        categories,
        note: note.trim() ? note.trim() : null,
      });
    } catch {
      setSaving(false);
      setError("Could not save on this phone.");
    }
  }

  return (
    <form onSubmit={onSubmit}>
      <h1>{title}</h1>
      <div className="stack">
        <DateField
          label="Date"
          value={trainedOn}
          open={dateOpen}
          onToggle={() => setDateOpen((open) => !open)}
          onChange={(iso) => {
            setTrainedOn(iso);
            setDateOpen(false);
          }}
          marked={marked}
        />
        <label>
          Duration
          <input
            inputMode="numeric"
            type="number"
            min={1}
            max={1440}
            placeholder="Minutes"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            required
          />
        </label>
        <div className="presets">
          {PRESETS.map((minutes) => (
            <button
              key={minutes}
              type="button"
              className="chip"
              aria-pressed={duration === String(minutes)}
              onClick={() => setDuration(String(minutes))}
            >
              {minutes}
            </button>
          ))}
        </div>
        <div className="chips" role="group" aria-label="Categories">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              className="chip"
              aria-pressed={categories.includes(category)}
              onClick={() => toggle(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <label>
          Note
          <input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional" maxLength={2000} />
        </label>
      </div>
      {error ? <p className="error">{error}</p> : null}
      <button className="button" type="submit" disabled={!ready || saving}>
        {saving ? "Saving" : submitLabel}
      </button>
    </form>
  );
}
