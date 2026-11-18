import {
  countOccurrencesBefore,
  getDueOccurrences,
  getNextDate,
  getOccurrenceDate,
  getRuleStatus,
} from "./recurring";
import { makeRule } from "../test/factories";

describe("getOccurrenceDate", () => {
  it("handles weekly rules", () => {
    expect(getOccurrenceDate("2026-11-02", "weekly", 0)).toBe("2026-11-02");
    expect(getOccurrenceDate("2026-11-02", "weekly", 2)).toBe("2026-11-16");
  });

  it("clamps the 31st in short months without drifting", () => {
    expect(getOccurrenceDate("2026-01-31", "monthly", 1)).toBe("2026-02-28");
    expect(getOccurrenceDate("2026-01-31", "monthly", 2)).toBe("2026-03-31");
  });

  it("rolls over the year for monthly rules", () => {
    expect(getOccurrenceDate("2026-11-15", "monthly", 3)).toBe("2027-02-15");
  });

  it("handles Feb 29 for yearly rules", () => {
    expect(getOccurrenceDate("2024-02-29", "yearly", 1)).toBe("2025-02-28");
    expect(getOccurrenceDate("2024-02-29", "yearly", 4)).toBe("2028-02-29");
  });
});

describe("getDueOccurrences", () => {
  it("returns every missed occurrence up to today (catch-up)", () => {
    const rule = makeRule({ startDate: "2026-09-15" });
    expect(getDueOccurrences(rule, "2026-11-18")).toEqual([
      "2026-09-15",
      "2026-10-15",
      "2026-11-15",
    ]);
  });

  it("continues from the already generated count", () => {
    const rule = makeRule({ startDate: "2026-09-15", occurrences: 2 });
    expect(getDueOccurrences(rule, "2026-11-18")).toEqual(["2026-11-15"]);
  });

  it("includes an occurrence that falls exactly on today", () => {
    const rule = makeRule({ startDate: "2026-11-18" });
    expect(getDueOccurrences(rule, "2026-11-18")).toEqual(["2026-11-18"]);
  });

  it("stops at the end date", () => {
    const rule = makeRule({ startDate: "2026-09-15", endDate: "2026-10-31" });
    expect(getDueOccurrences(rule, "2026-11-18")).toEqual([
      "2026-09-15",
      "2026-10-15",
    ]);
  });

  it("returns nothing for paused rules or future start dates", () => {
    expect(
      getDueOccurrences(makeRule({ active: false }), "2026-11-18"),
    ).toEqual([]);
    expect(
      getDueOccurrences(makeRule({ startDate: "2027-01-01" }), "2026-11-18"),
    ).toEqual([]);
  });
});

describe("countOccurrencesBefore", () => {
  it("counts occurrences strictly before the given date", () => {
    expect(countOccurrencesBefore("2026-09-15", "monthly", "2026-11-18")).toBe(
      3,
    );
    expect(countOccurrencesBefore("2026-09-15", "monthly", "2026-11-15")).toBe(
      2,
    );
  });
});

describe("getNextDate / getRuleStatus", () => {
  it("reports the next date for an active rule", () => {
    const rule = makeRule({ startDate: "2026-09-15", occurrences: 3 });
    expect(getNextDate(rule)).toBe("2026-12-15");
    expect(getRuleStatus(rule)).toBe("active");
  });

  it("reports ended when the next date is past the end date", () => {
    const rule = makeRule({
      startDate: "2026-09-15",
      endDate: "2026-10-31",
      occurrences: 2,
    });
    expect(getNextDate(rule)).toBeNull();
    expect(getRuleStatus(rule)).toBe("ended");
  });

  it("reports paused", () => {
    expect(getRuleStatus(makeRule({ active: false }))).toBe("paused");
  });
});
