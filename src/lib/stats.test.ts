import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  activitySeries,
  durationSuffix,
  feelingSeries,
  formatDuration,
  formatFeeling,
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
    feeling: partial.feeling ?? null,
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
    assert.equal(summary.averageFeeling, null);
  });

  it("averages only sessions that have a feeling", () => {
    const summary = summarize(
      [
        session({ trainedOn: "2026-11-02", durationMinutes: 30, categories: ["lowers"], feeling: 10 }),
        session({ id: "22222222-2222-4222-8222-222222222222", trainedOn: "2026-11-02", durationMinutes: 20, categories: ["uppers"], feeling: 7 }),
        session({ id: "33333333-3333-4333-8333-333333333333", trainedOn: "2026-11-03", durationMinutes: 15, categories: ["sitdown"] }),
      ],
      "2026-11-01",
      "2026-11-03",
    );
    assert.equal(summary.sessionCount, 3);
    assert.equal(summary.averageFeeling, 8.5);
    assert.equal(formatFeeling(summary.averageFeeling ?? 0), "8.5");
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

describe("activitySeries", () => {
  const sessions = [
    session({ trainedOn: "2026-11-02", durationMinutes: 45, categories: ["lowers", "transitions"], feeling: 8 }),
    session({
      id: "22222222-2222-4222-8222-222222222222",
      trainedOn: "2026-11-02",
      durationMinutes: 15,
      categories: ["uppers"],
      feeling: 4,
    }),
    session({
      id: "55555555-5555-4555-8555-555555555555",
      trainedOn: "2026-03-10",
      durationMinutes: 60,
      categories: ["lowers"],
      feeling: 10,
    }),
  ];
  const today = new Date(2026, 10, 2);

  it("counts each day of the current week", () => {
    const series = activitySeries(sessions, "week", today);
    assert.equal(series.length, 7);
    assert.deepEqual(series.map((point) => point.label), ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    assert.equal(series[0].sessions, 2);
    assert.equal(series[0].minutes, 60);
    assert.equal(series[0].feeling, 6);
    assert.equal(series.slice(1).every((point) => point.sessions === 0 && point.feeling == null), true);
    assert.deepEqual(feelingSeries(series).map((point) => point.label), ["Mon"]);
  });

  it("counts each day of the current month", () => {
    const series = activitySeries(sessions, "month", today);
    assert.equal(series.length, 30);
    assert.equal(series[0].label, "1");
    assert.equal(series[1].sessions, 2);
    assert.equal(series[1].minutes, 60);
    assert.equal(series[0].sessions, 0);
  });

  it("counts each month of the current year", () => {
    const series = activitySeries(sessions, "year", today);
    assert.equal(series.length, 12);
    assert.equal(series[2].label, "Mar");
    assert.equal(series[2].sessions, 1);
    assert.equal(series[2].minutes, 60);
    assert.equal(series[2].feeling, 10);
    assert.equal(series[10].sessions, 2);
    assert.equal(series[10].minutes, 60);
    assert.equal(series[10].feeling, 6);
    assert.equal(series[0].feeling, null);
    assert.deepEqual(
      feelingSeries(series).map((point) => point.label),
      ["Mar", "Nov"],
    );
  });
});

describe("formatDuration", () => {
  it("keeps minutes whole and rounds hours to the nearest hundredth", () => {
    assert.equal(formatDuration(90, "minutes"), "90");
    assert.equal(formatDuration(60, "hours"), "1");
    assert.equal(formatDuration(90, "hours"), "1.5");
    assert.equal(formatDuration(105, "hours"), "1.75");
    assert.equal(formatDuration(100, "hours"), "1.67");
    assert.equal(durationSuffix("hours"), "h");
    assert.equal(durationSuffix("minutes"), "min");
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
