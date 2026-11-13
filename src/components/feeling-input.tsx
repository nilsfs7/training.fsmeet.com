"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { isHomeDays, parseUserCategories, type DurationUnit, type FeelingInput, type UserCategory } from "@/lib/types";

const FEELING_KEY = "fs-feeling-input";
const DURATION_KEY = "fs-duration-unit";
const CATEGORIES_KEY = "fs-categories";
const HOME_DAYS_KEY = "fs-home-days";

const FeelingInputContext = createContext<{
  feelingInput: FeelingInput;
  durationUnit: DurationUnit;
  categories: UserCategory[];
  homeDays: number;
  save: (value: FeelingInput) => Promise<void>;
  saveDuration: (value: DurationUnit) => Promise<void>;
  saveCategories: (value: UserCategory[]) => Promise<void>;
  saveHomeDays: (value: number) => Promise<void>;
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

function readHomeDaysCache(): number | null {
  try {
    const value = Number(localStorage.getItem(HOME_DAYS_KEY));
    return isHomeDays(value) ? value : null;
  } catch {
    return null;
  }
}

function writeHomeDaysCache(value: number) {
  try {
    localStorage.setItem(HOME_DAYS_KEY, String(value));
  } catch {
    // The database remains the stored preference.
  }
}

export function FeelingInputProvider({
  initial,
  durationUnit: initialDuration,
  categories: initialCategories,
  homeDays: initialHomeDays,
  confirmed,
  children,
}: {
  initial: FeelingInput;
  durationUnit: DurationUnit;
  categories: UserCategory[];
  homeDays: number;
  confirmed: boolean;
  children: React.ReactNode;
}) {
  const [feelingInput, setFeelingInput] = useState<FeelingInput>(initial);
  const [durationUnit, setDurationUnit] = useState<DurationUnit>(initialDuration);
  const [categories, setCategories] = useState<UserCategory[]>(initialCategories);
  const [homeDays, setHomeDays] = useState(initialHomeDays);

  useEffect(() => {
    if (confirmed) {
      setFeelingInput(initial);
      setDurationUnit(initialDuration);
      setCategories(initialCategories);
      setHomeDays(initialHomeDays);
      writeCache(initial);
      writeDurationCache(initialDuration);
      writeCategoriesCache(initialCategories);
      writeHomeDaysCache(initialHomeDays);
      return;
    }
    const cached = readCache();
    const cachedDuration = readDurationCache();
    const cachedCategories = readCategoriesCache();
    const cachedHomeDays = readHomeDaysCache();
    if (cached) setFeelingInput(cached);
    if (cachedDuration) setDurationUnit(cachedDuration);
    if (cachedCategories) setCategories(cachedCategories);
    if (cachedHomeDays) setHomeDays(cachedHomeDays);
  }, [confirmed, initial, initialDuration, initialCategories, initialHomeDays]);

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

  async function saveHomeDays(value: number) {
    const response = await fetch("/api/settings", {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ homeDays: value }),
    });
    if (!response.ok) throw new Error("Could not save this setting.");
    setHomeDays(value);
    writeHomeDaysCache(value);
  }

  return (
    <FeelingInputContext.Provider value={{ feelingInput, durationUnit, categories, homeDays, save, saveDuration, saveCategories, saveHomeDays }}>
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

export function useHomeDays() {
  return useFeelingInput().homeDays;
}
