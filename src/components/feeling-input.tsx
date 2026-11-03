"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { DurationUnit, FeelingInput } from "@/lib/types";

const FEELING_KEY = "fs-feeling-input";
const DURATION_KEY = "fs-duration-unit";

const FeelingInputContext = createContext<{
  feelingInput: FeelingInput;
  durationUnit: DurationUnit;
  save: (value: FeelingInput) => Promise<void>;
  saveDuration: (value: DurationUnit) => Promise<void>;
} | null>(null);

function readCache(): FeelingInput | null {
  try {
    const value = localStorage.getItem(FEELING_KEY);
    return value === "emoji" || value === "score" ? value : null;
  } catch {
    return null;
  }
}

function writeCache(value: FeelingInput) {
  try {
    localStorage.setItem(FEELING_KEY, value);
  } catch {
    // The database remains the stored preference.
  }
}

function readDurationCache(): DurationUnit | null {
  try {
    const value = localStorage.getItem(DURATION_KEY);
    return value === "hours" || value === "minutes" ? value : null;
  } catch {
    return null;
  }
}

function writeDurationCache(value: DurationUnit) {
  try {
    localStorage.setItem(DURATION_KEY, value);
  } catch {
    // The database remains the stored preference.
  }
}

export function FeelingInputProvider({
  initial,
  durationUnit: initialDuration,
  confirmed,
  children,
}: {
  initial: FeelingInput;
  durationUnit: DurationUnit;
  confirmed: boolean;
  children: React.ReactNode;
}) {
  const [feelingInput, setFeelingInput] = useState<FeelingInput>(initial);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initialDuration);

  useEffect(() => {
    if (confirmed) {
      setFeelingInput(initial);
      setDurationUnit(initialDuration);
      writeCache(initial);
      writeDurationCache(initialDuration);
      return;
    }
    const cached = readCache();
    const cachedDuration = readDurationCache();
    if (cached) setFeelingInput(cached);
    if (cachedDuration) setDurationUnit(cachedDuration);
  }, [confirmed, initial, initialDuration]);

  async function save(value: FeelingInput) {
    const response = await fetch("/api/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ feelingInput: value }),
    });
    if (!response.ok) throw new Error("Could not save this setting.");
    setFeelingInput(value);
    writeCache(value);
  }

  async function saveDuration(value: DurationUnit) {
    const response = await fetch("/api/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ durationUnit: value }),
    });
    if (!response.ok) throw new Error("Could not save this setting.");
    setDurationUnit(value);
    writeDurationCache(value);
  }

  return (
    <FeelingInputContext.Provider value={{ feelingInput, durationUnit, save, saveDuration }}>
      {children}
    </FeelingInputContext.Provider>
  );
}

export function useFeelingInput() {
  const value = useContext(FeelingInputContext);
  if (!value) throw new Error("Feeling input is missing");
  return value;
}

export function useDurationUnit() {
  return useFeelingInput().durationUnit;
}
