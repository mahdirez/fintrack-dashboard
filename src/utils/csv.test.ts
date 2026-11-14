import { transactionsToCSV } from "./csv";
import { defaultCategories } from "./defaultCategories";
import { makeTransaction } from "../test/factories";

describe("transactionsToCSV", () => {
  it("starts with the header row", () => {
    const csv = transactionsToCSV([], defaultCategories);
    expect(csv).toBe("Date,Title,Type,Category,Amount,Note");
  });

  it("serializes a row with category name and fixed decimals", () => {
    const csv = transactionsToCSV(
      [
        makeTransaction({
          title: "Lunch",
          amount: 12.5,
          categoryId: "food",
          date: "2026-11-02",
        }),
      ],
      defaultCategories,
    );
    expect(csv.split("\r\n")[1]).toBe("2026-11-02,Lunch,expense,Food,12.50,");
  });

  it("escapes commas and quotes", () => {
    const csv = transactionsToCSV(
      [makeTransaction({ title: 'Lunch, with "friends"' })],
      defaultCategories,
    );
    expect(csv).toContain('"Lunch, with ""friends"""');
  });

  it("neutralizes formula injection", () => {
    const csv = transactionsToCSV(
      [makeTransaction({ title: "=1+1" })],
      defaultCategories,
    );
    expect(csv).toContain("'=1+1");
  });

  it('uses "Unknown" for missing categories', () => {
    const csv = transactionsToCSV(
      [makeTransaction({ categoryId: "ghost" })],
      defaultCategories,
    );
    expect(csv).toContain(",Unknown,");
  });
});
