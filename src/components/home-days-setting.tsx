"use client";

import { useEffect, useState } from "react";
import { useFeelingInput } from "@/components/feeling-input";
import { isHomeDays } from "@/lib/types";

export function HomeDaysSetting() {
  const { homeDays, saveHomeDays } = useFeelingInput();
  const [draft, setDraft] = useState(String(homeDays));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraft(String(homeDays));
  }, [homeDays]);

  function shownDays(): number {
    const parsed = Number(draft);
    return isHomeDays(parsed) ? parsed : homeDays;
  }

  async function commit(value: number) {
    if (!isHomeDays(value)) {
      setDraft(String(homeDays));
      setError("Choose a length from 7 to 30 days.");
      return;
    }
    setError(null);
    setDraft(String(value));
    if (value === homeDays || saving) return;
    setSaving(true);
    try {
      await saveHomeDays(value);
    } catch {
      setError("Could not save this setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card account-card">
      <p className="eyebrow">Home</p>
      <div className="day-stepper" role="group" aria-label="Home review length">
        <button type="button" className="chip" aria-label="Fewer days" disabled={saving || shownDays() <= 7} onClick={() => void commit(shownDays() - 1)}>
          −
        </button>
        <input
          aria-label="Days on the start page"
          inputMode="numeric"
          value={draft}
          disabled={saving}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => {
            const next = event.relatedTarget;
            if (next instanceof HTMLElement && next.closest(".day-stepper")) return;
            void commit(Number(event.currentTarget.value));
          }}
        />
        <button type="button" className="chip" aria-label="More days" disabled={saving || shownDays() >= 30} onClick={() => void commit(shownDays() + 1)}>
          +
        </button>
      </div>
      <p className="meta">The start page shows the last 7 to 30 days.</p>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
