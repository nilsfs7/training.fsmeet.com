"use client";

import { useState } from "react";
import { useFeelingInput } from "@/components/feeling-input";
import type { DurationUnit } from "@/lib/types";

export function DurationSetting() {
  const { durationUnit, saveDuration } = useFeelingInput();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(value: DurationUnit) {
    if (value === durationUnit || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveDuration(value);
    } catch {
      setError("Could not save this setting.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card account-card">
      <p className="eyebrow">Duration</p>
      <div className="setting-switch" role="group" aria-label="Duration unit">
        <button type="button" className="chip" aria-pressed={durationUnit === "hours"} disabled={saving} onClick={() => choose("hours")}>
          Hours
        </button>
        <button type="button" className="chip" aria-pressed={durationUnit === "minutes"} disabled={saving} onClick={() => choose("minutes")}>
          Minutes
        </button>
      </div>
      <p className="meta">Training time is shown in hours or minutes.</p>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
