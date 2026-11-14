import { getExpenseByCategory, getMonthlyTotals } from "./chartData";
import { defaultCategories } from "./defaultCategories";
import { makeTransaction } from "../test/factories";

describe("getExpenseByCategory", () => {
  it("sums expenses per category, largest first, ignoring income", () => {
    const result = getExpenseByCategory(
      [
        makeTransaction({ categoryId: "food", amount: 30 }),
        makeTransaction({ categoryId: "food", amount: 20 }),
        makeTransaction({ categoryId: "transport", amount: 80 }),
        makeTransaction({ categoryId: "salary", type: "income", amount: 5000 }),
      ],
      defaultCategories,
    );

    expect(result.map((d) => [d.id, d.value])).toEqual([
      ["transport", 80],
      ["food", 50],
    ]);
  });
});

describe("getMonthlyTotals", () => {
  const now = new Date(2026, 10, 15);

  it("returns the requested number of months, including empty ones", () => {
    const result = getMonthlyTotals([], 6, now);
    expect(result).toHaveLength(6);
    expect(result.every((m) => m.income === 0 && m.expense === 0)).toBe(true);
  });

  it("buckets transactions into the right month", () => {
    const result = getMonthlyTotals(
      [
        makeTransaction({ type: "income", amount: 1000, date: "2026-11-01" }),
        makeTransaction({ type: "expense", amount: 200, date: "2026-10-15" }),
        makeTransaction({ type: "expense", amount: 50, date: "2020-01-01" }), 
      ],
      6,
      now,
    );

    const last = result[result.length - 1];
    const previous = result[result.length - 2];
    expect(last.income).toBe(1000);
    expect(previous.expense).toBe(200);
  });
});
