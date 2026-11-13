import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseSession, SessionInputError } from "./sessions";
import { defaultCategories, isHomeDays, parseUserCategories } from "./types";

const base = {
  id: "11111111-1111-4111-8111-111111111111",
  trainedOn: "2026-11-03",
  durationMinutes: 45,
  categories: ["lowers"],
  createdAt: "2026-11-03T12:00:00.000Z",
};

describe("parseSession feeling", () => {
  it("keeps a missing feeling empty", () => {
    assert.equal(parseSession(base).feeling, null);
  });

  it("maps a stored word onto its score", () => {
    assert.equal(parseSession({ ...base, feeling: "rough" }).feeling, 1);
    assert.equal(parseSession({ ...base, feeling: "hard" }).feeling, 3);
    assert.equal(parseSession({ ...base, feeling: "okay" }).feeling, 5);
    assert.equal(parseSession({ ...base, feeling: "good" }).feeling, 8);
    assert.equal(parseSession({ ...base, feeling: "great" }).feeling, 10);
  });

  it("rejects an unknown level", () => {
    assert.throws(() => parseSession({ ...base, feeling: "amazing" }), SessionInputError);
  });

  it("keeps a score between the emoji levels", () => {
    assert.equal(parseSession({ ...base, feeling: 7 }).feeling, 7);
  });

  it("keeps a score from 1 to 10", () => {
    assert.equal(parseSession({ ...base, feeling: 1 }).feeling, 1);
    assert.equal(parseSession({ ...base, feeling: 10 }).feeling, 10);
  });

  it("rejects a score outside 1 to 10", () => {
    assert.throws(() => parseSession({ ...base, feeling: 0 }), SessionInputError);
    assert.throws(() => parseSession({ ...base, feeling: 11 }), SessionInputError);
    assert.throws(() => parseSession({ ...base, feeling: 1.5 }), SessionInputError);
  });

  it("accepts a custom category id", () => {
    assert.deepEqual(parseSession({ ...base, categories: ["c1234abcd"] }).categories, ["c1234abcd"]);
  });
});

describe("isHomeDays", () => {
  it("accepts 7 through 30", () => {
    assert.equal(isHomeDays(7), true);
    assert.equal(isHomeDays(30), true);
    assert.equal(isHomeDays(6), false);
    assert.equal(isHomeDays(31), false);
    assert.equal(isHomeDays(7.5), false);
  });
});

describe("parseUserCategories", () => {
  it("keeps the five defaults", () => {
    const categories = defaultCategories();
    assert.deepEqual(parseUserCategories(categories)?.map((category) => category.id), [
      "lowers",
      "uppers",
      "sitdown",
      "acrobatics",
      "transitions",
    ]);
  });

  it("rejects fewer than three, more than five, and duplicate names", () => {
    const [first, second, third] = defaultCategories();
    assert.equal(parseUserCategories([first, second]), null);
    assert.equal(parseUserCategories([...defaultCategories(), { id: "cextra123", label: "extra" }]), null);
    assert.equal(parseUserCategories([first, second, { id: third.id, label: " Lowers " }]), null);
    assert.equal(parseUserCategories([first, second, { ...third, label: "" }]), null);
    assert.deepEqual(parseUserCategories([{ ...first, label: " Feet " }, second, third]), [
      { id: "lowers", label: "Feet" },
      { id: "uppers", label: "uppers" },
      { id: "sitdown", label: "sitdown" },
    ]);
  });
});
