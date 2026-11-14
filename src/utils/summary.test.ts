import { calculateSummary } from "./summary";
import { makeTransaction } from "../test/factories";

describe("calculateSummary", () => {
  it("returns zeros for an empty list", () => {
    expect(calculateSummary([])).toEqual({ income: 0, expense: 0, balance: 0 });
  });

  it("sums income and expense and computes balance", () => {
    const result = calculateSummary([
      makeTransaction({ type: "income", amount: 1000 }),
      makeTransaction({ type: "expense", amount: 300 }),
      makeTransaction({ type: "expense", amount: 200 }),
    ]);
    expect(result).toEqual({ income: 1000, expense: 500, balance: 500 });
  });

  it("allows a negative balance", () => {
    const result = calculateSummary([
      makeTransaction({ type: "expense", amount: 50 }),
    ]);
    expect(result.balance).toBe(-50);
  });
});
