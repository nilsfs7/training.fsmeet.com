"use client";

import { useState } from "react";
import { useFeelingInput } from "@/components/feeling-input";
import type { FeelingInput } from "@/lib/types";

export function FeelingSetting() {
  const { feelingInput, save } = useFeelingInput();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(value: FeelingInput) {
    if (value === feelingInput || saving) return;
    setSaving(true);
    setError(null);
    try {
      await save(value);
    } catch {
      setError("Could not save this setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card account-card">
      <p className="eyebrow">Feeling</p>
      <div className="setting-switch" role="group" aria-label="Feeling entry">
        <button type="button" className="chip" aria-pressed={feelingInput === "emoji"} disabled={saving} onClick={() => choose("emoji")}>
          Emojis
        </button>
        <button type="button" className="chip" aria-pressed={feelingInput === "score"} disabled={saving} onClick={() => choose("score")}>
          1–10
        </button>
      </div>
      <p className="meta">Five faces, or a score from 1 to 10.</p>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
