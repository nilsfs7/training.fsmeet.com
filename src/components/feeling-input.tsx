"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { parseUserCategories, type DurationUnit, type FeelingInput, type UserCategory } from "@/lib/types";

const FEELING_KEY = "fs-feeling-input";
const DURATION_KEY = "fs-duration-unit";
const CATEGORIES_KEY = "fs-categories";

const FeelingInputContext = createContext<{
  feelingInput: FeelingInput;
  durationUnit: DurationUnit;
  categories: UserCategory[];
  save: (value: FeelingInput) => Promise<void>;
  saveDuration: (value: DurationUnit) => Promise<void>;
  saveCategories: (value: UserCategory[]) => Promise<void>;
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

function readCategoriesCache(): UserCategory[] | null {
  try {
    const value = localStorage.getItem(CATEGORIES_KEY);
    return value ? parseUserCategories(JSON.parse(value)) : null;
  } catch {
    return null;
  }
}

function writeCategoriesCache(value: UserCategory[]) {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(value));
  } catch {
    // The database remains the stored preference.
  }
}

export function FeelingInputProvider({
  initial,
  durationUnit: initialDuration,
  categories: initialCategories,
  confirmed,
  children,
}: {
  initial: FeelingInput;
  durationUnit: DurationUnit;
  categories: UserCategory[];
  confirmed: boolean;
  children: React.ReactNode;
}) {
  const [feelingInput, setFeelingInput] = useState<FeelingInput>(initial);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initialDuration);
  const [categories, setCategories] = useState<UserCategory[]>(initialCategories);

  useEffect(() => {
    if (confirmed) {
      setFeelingInput(initial);
      setDurationUnit(initialDuration);
      setCategories(initialCategories);
      writeCache(initial);
      writeDurationCache(initialDuration);
      writeCategoriesCache(initialCategories);
      return;
    }
    const cached = readCache();
    const cachedDuration = readDurationCache();
    const cachedCategories = readCategoriesCache();
    if (cached) setFeelingInput(cached);
    if (cachedDuration) setDurationUnit(cachedDuration);
    if (cachedCategories) setCategories(cachedCategories);
  }, [confirmed, initial, initialDuration, initialCategories]);

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

  async function saveCategories(value: UserCategory[]) {
    const response = await fetch("/api/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ categories: value }),
    });
    if (!response.ok) throw new Error("Could not save this setting.");
    setCategories(value);
    writeCategoriesCache(value);
  }

  return (
    <FeelingInputContext.Provider value={{ feelingInput, durationUnit, categories, save, saveDuration, saveCategories }}>
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

export function useCategories() {
  return useFeelingInput().categories;
}
