import { filterByRange } from "./dateRange";
import { makeTransaction } from "../test/factories";

const now = new Date(2026, 10, 15);

const data = [
  makeTransaction({ id: "this-month", date: "2026-11-03" }),
  makeTransaction({ id: "last-month", date: "2026-10-20" }),
  makeTransaction({ id: "old", date: "2026-08-01" }),
  makeTransaction({ id: "future", date: "2026-11-30" }),
];

describe("filterByRange", () => {
  it('"all" returns everything', () => {
    expect(filterByRange(data, "all", now)).toHaveLength(4);
  });

  it('"month" keeps only current month up to today', () => {
    const ids = filterByRange(data, "month", now).map((t) => t.id);
    expect(ids).toEqual(["this-month"]);
  });

  it('"30days" keeps the last 30 days', () => {
    const ids = filterByRange(data, "30days", now).map((t) => t.id);
    expect(ids).toEqual(["this-month", "last-month"]);
  });
});
