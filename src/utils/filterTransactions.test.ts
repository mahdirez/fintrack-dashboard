import {
  defaultFilters,
  filterTransactions,
  hasActiveFilters,
} from "./filterTransactions";
import { makeTransaction } from "../test/factories";

const data = [
  makeTransaction({
    id: "1",
    title: "Grocery",
    type: "expense",
    categoryId: "food",
    date: "2026-11-01",
  }),
  makeTransaction({
    id: "2",
    title: "Salary",
    type: "income",
    categoryId: "salary",
    date: "2026-11-05",
  }),
  makeTransaction({
    id: "3",
    title: "Bus ticket",
    type: "expense",
    categoryId: "transport",
    date: "2026-11-10",
  }),
];

describe("filterTransactions", () => {
  it("returns everything with default filters", () => {
    expect(filterTransactions(data, defaultFilters)).toHaveLength(3);
  });

  it("searches by title, case-insensitive", () => {
    const result = filterTransactions(data, {
      ...defaultFilters,
      search: "gRoC",
    });
    expect(result.map((t) => t.id)).toEqual(["1"]);
  });

  it("filters by type", () => {
    const result = filterTransactions(data, {
      ...defaultFilters,
      type: "income",
    });
    expect(result.map((t) => t.id)).toEqual(["2"]);
  });

  it("filters by category", () => {
    const result = filterTransactions(data, {
      ...defaultFilters,
      categoryId: "transport",
    });
    expect(result.map((t) => t.id)).toEqual(["3"]);
  });

  it("includes both boundary dates", () => {
    const result = filterTransactions(data, {
      ...defaultFilters,
      dateFrom: "2026-11-01",
      dateTo: "2026-11-05",
    });
    expect(result.map((t) => t.id)).toEqual(["1", "2"]);
  });

  it("combines multiple filters", () => {
    const result = filterTransactions(data, {
      ...defaultFilters,
      type: "expense",
      dateFrom: "2026-11-02",
    });
    expect(result.map((t) => t.id)).toEqual(["3"]);
  });
});

describe("hasActiveFilters", () => {
  it("is false for default filters", () => {
    expect(hasActiveFilters(defaultFilters)).toBe(false);
  });

  it("is true when any filter is set", () => {
    expect(hasActiveFilters({ ...defaultFilters, search: "x" })).toBe(true);
    expect(hasActiveFilters({ ...defaultFilters, type: "income" })).toBe(true);
  });
});
