import { getBudgetProgress, getStatus } from "./budget";
import { defaultCategories } from "./defaultCategories";
import { makeTransaction } from "../test/factories";

const now = new Date(2026, 10, 15);

describe("getStatus", () => {
  it("maps percent to status", () => {
    expect(getStatus(0)).toBe("ok");
    expect(getStatus(79.9)).toBe("ok");
    expect(getStatus(80)).toBe("warning");
    expect(getStatus(99.9)).toBe("warning");
    expect(getStatus(100)).toBe("exceeded");
    expect(getStatus(150)).toBe("exceeded");
  });
});

describe("getBudgetProgress", () => {
  const budgets = [{ categoryId: "food", limit: 200 }];

  it("counts only expenses of the current month for that category", () => {
    const transactions = [
      makeTransaction({ categoryId: "food", amount: 50, date: "2026-11-02" }),
      makeTransaction({ categoryId: "food", amount: 70, date: "2026-11-09" }),
      makeTransaction({ categoryId: "food", amount: 999, date: "2026-10-30" }),
      makeTransaction({
        categoryId: "transport",
        amount: 500,
        date: "2026-11-03",
      }),
      makeTransaction({
        categoryId: "food",
        type: "income",
        amount: 400,
        date: "2026-11-04",
      }),
    ];

    const [result] = getBudgetProgress(
      budgets,
      defaultCategories,
      transactions,
      now,
    );

    expect(result.spent).toBe(120);
    expect(result.remaining).toBe(80);
    expect(result.percent).toBe(60);
    expect(result.status).toBe("ok");
  });

  it("reports exceeded when spending passes the limit", () => {
    const transactions = [
      makeTransaction({ categoryId: "food", amount: 250, date: "2026-11-02" }),
    ];
    const [result] = getBudgetProgress(
      budgets,
      defaultCategories,
      transactions,
      now,
    );

    expect(result.status).toBe("exceeded");
    expect(result.remaining).toBe(-50);
    expect(result.percent).toBe(125);
  });

  it("sorts the most critical budgets first", () => {
    const result = getBudgetProgress(
      [
        { categoryId: "food", limit: 100 },
        { categoryId: "transport", limit: 100 },
      ],
      defaultCategories,
      [
        makeTransaction({ categoryId: "food", amount: 20, date: "2026-11-02" }),
        makeTransaction({
          categoryId: "transport",
          amount: 90,
          date: "2026-11-02",
        }),
      ],
      now,
    );
    expect(result.map((r) => r.category.id)).toEqual(["transport", "food"]);
  });

  it("ignores budgets whose category no longer exists", () => {
    const result = getBudgetProgress(
      [{ categoryId: "ghost", limit: 100 }],
      defaultCategories,
      [],
      now,
    );
    expect(result).toEqual([]);
  });
});
