import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  monthRange,
  summarize,
  topCategories,
  weekRange,
  yearRange,
} from "./stats";
import type { Session } from "./types";

function session(partial: Partial<Session> & Pick<Session, "trainedOn" | "durationMinutes" | "categories">): Session {
  return {
    id: partial.id ?? "11111111-1111-4111-8111-111111111111",
    trainedOn: partial.trainedOn,
    durationMinutes: partial.durationMinutes,
    categories: partial.categories,
    note: partial.note ?? null,
    createdAt: partial.createdAt ?? "2026-11-01T12:00:00.000Z",
  };
}

describe("weekRange", () => {
  it("starts on Monday for a Sunday", () => {
    const range = weekRange(new Date(2026, 10, 1));
    assert.equal(range.start, "2026-10-26");
    assert.equal(range.end, "2026-11-01");
  });

  it("starts on Monday for a Wednesday", () => {
    const range = weekRange(new Date(2026, 10, 4));
    assert.equal(range.start, "2026-11-02");
    assert.equal(range.end, "2026-11-08");
  });
});

describe("summarize", () => {
  it("counts a session once and adds its full duration to every selected category", () => {
    const summary = summarize(
      [
        session({
          trainedOn: "2026-11-01",
          durationMinutes: 45,
          categories: ["lowers", "transitions"],
        }),
        session({
          id: "22222222-2222-4222-8222-222222222222",
          trainedOn: "2026-10-01",
          durationMinutes: 30,
          categories: ["uppers"],
        }),
      ],
      "2026-10-26",
      "2026-11-01",
    );

    assert.equal(summary.totalMinutes, 45);
    assert.equal(summary.sessionCount, 1);
    assert.equal(summary.dayCount, 1);
    assert.equal(summary.byCategory.lowers, 45);
    assert.equal(summary.byCategory.transitions, 45);
    assert.equal(summary.byCategory.uppers, 0);
  });
});

describe("monthRange", () => {
  it("covers the calendar month", () => {
    assert.deepEqual(monthRange(new Date(2026, 10, 15)), {
      start: "2026-11-01",
      end: "2026-11-30",
    });
  });
});

describe("yearRange", () => {
  it("covers the calendar year", () => {
    assert.deepEqual(yearRange(new Date(2026, 10, 1)), {
      start: "2026-01-01",
      end: "2026-12-31",
    });
  });

  it("includes 29 February in a leap year", () => {
    assert.deepEqual(yearRange(new Date(2024, 1, 29)), {
      start: "2024-01-01",
      end: "2024-12-31",
    });
  });
});

describe("topCategories", () => {
  it("returns every category that shares the highest minutes", () => {
    assert.deepEqual(
      topCategories({
        lowers: 40,
        uppers: 40,
        sitdown: 10,
        transitions: 0,
        acrobatics: 0,
      }),
      ["lowers", "uppers"],
    );
  });
});
