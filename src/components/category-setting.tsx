"use client";

import { useEffect, useRef, useState } from "react";
import { useFeelingInput } from "@/components/feeling-input";
import { newCategoryId, parseUserCategories, type UserCategory } from "@/lib/types";

export function CategorySetting() {
  const { categories, saveCategories } = useFeelingInput();
  const [draft, setDraft] = useState<UserCategory[]>(categories);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);
  const pending = useRef(Promise.resolve());

  useEffect(() => {
    setDraft((current) => {
      const same =
        current.length === categories.length &&
        current.every((category, index) => category.id === categories[index]?.id && category.label === categories[index]?.label);
      return same ? current : categories;
    });
  }, [categories]);

  function unchanged(next: UserCategory[]) {
    return next.length === categories.length && next.every((category, index) => category.id === categories[index]?.id && category.label.trim() === categories[index]?.label);
  }

  function commit(next: UserCategory[]) {
    pending.current = pending.current.then(() => persist(next));
  }

  async function persist(next: UserCategory[]) {
    if (unchanged(next)) {
      setError(null);
      return;
    }
    const parsed = parseUserCategories(next);
    if (!parsed) {
      setError("Use 3 to 5 categories, each with its own name.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await saveCategories(parsed);
    } catch {
      setError("Could not save this setting.");
    } finally {
      setSaving(false);
    }
  }

  function rename(id: string, label: string) {
    setPendingRemoval(null);
    setDraft((current) => current.map((category) => (category.id === id ? { ...category, label } : category)));
  }

  function remove(category: UserCategory) {
    if (pendingRemoval !== category.id) {
      setPendingRemoval(category.id);
      return;
    }
    const next = draft.filter((item) => item.id !== category.id);
    setDraft(next);
    setPendingRemoval(null);
    void commit(next);
  }

  return (
    <section className="card account-card">
      <p className="eyebrow">Categories</p>
      <div className="category-editor">
        {draft.map((category) => {
          const confirming = pendingRemoval === category.id;
          return (
            <div className="category-item" key={category.id}>
              <div className="category-row">
                <input
                  aria-label="Category name"
                  value={category.label}
                  maxLength={24}
                  disabled={saving}
                  onChange={(event) => rename(category.id, event.target.value)}
                  onBlur={(event) => {
                    const next = draft.map((item) => (item.id === category.id ? { ...item, label: event.currentTarget.value } : item));
                    void commit(next);
                  }}
                />
                <button
                  type="button"
                  className="category-remove"
                  aria-label={confirming ? `Confirm removing ${category.label || "category"}` : `Remove ${category.label || "category"}`}
                  disabled={saving || draft.length <= 3}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => remove(category)}
                >
                  {confirming ? "Confirm" : "Remove"}
                </button>
              </div>
              {confirming ? (
                <p className="category-warning" role="status">
                  Logged training for this category can be lost.
                </p>
              ) : null}
            </div>
          );
        })}
      </div>
      <button
        type="button"
        className="button quiet"
        disabled={saving || draft.length >= 5}
        onClick={() => {
          setPendingRemoval(null);
          setDraft((current) => [...current, { id: newCategoryId(), label: "" }]);
        }}
      >
        Add category
      </button>
      <p className="meta">Rename, remove, or add categories. At least 3, at most 5.</p>
      {error ? <p className="error">{error}</p> : null}
    </section>
  );
}
