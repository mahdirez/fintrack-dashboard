import { useFinanceStore } from "./useFinanceStore";
import { defaultCategories } from "../utils/defaultCategories";
import { makeRule } from "../test/factories";
import { today } from "../utils/format";
import { countOccurrencesBefore } from "../utils/recurring";

const initialState = {
  transactions: [],
  categories: defaultCategories,
  budgets: [],
  recurringRules: [],
};

beforeEach(() => {
  useFinanceStore.setState(initialState);
});

const base = {
  title: "Test",
  amount: 10,
  type: "expense" as const,
  categoryId: "food",
  date: "2026-11-01",
};

describe("transactions", () => {
  it("adds a transaction with a generated id, newest first", () => {
    const { addTransaction } = useFinanceStore.getState();
    addTransaction({ ...base, title: "First" });
    addTransaction({ ...base, title: "Second" });

    const { transactions } = useFinanceStore.getState();
    expect(transactions).toHaveLength(2);
    expect(transactions[0].title).toBe("Second");
    expect(transactions[0].id).toBeTruthy();
  });

  it("updates only the targeted transaction", () => {
    const { addTransaction } = useFinanceStore.getState();
    addTransaction({ ...base, title: "A" });
    addTransaction({ ...base, title: "B" });

    const target = useFinanceStore.getState().transactions[0];
    useFinanceStore.getState().updateTransaction(target.id, { amount: 99 });

    const { transactions } = useFinanceStore.getState();
    expect(transactions[0].amount).toBe(99);
    expect(transactions[1].amount).toBe(10);
  });

  it("deletes a transaction", () => {
    useFinanceStore.getState().addTransaction(base);
    const [t] = useFinanceStore.getState().transactions;
    useFinanceStore.getState().deleteTransaction(t.id);
    expect(useFinanceStore.getState().transactions).toHaveLength(0);
  });
});

describe("budgets", () => {
  it("creates a budget, then updates it instead of duplicating", () => {
    const { setBudget } = useFinanceStore.getState();
    setBudget("food", 100);
    setBudget("food", 250);

    const { budgets } = useFinanceStore.getState();
    expect(budgets).toEqual([{ categoryId: "food", limit: 250 }]);
  });

  it("removes a budget", () => {
    const { setBudget, removeBudget } = useFinanceStore.getState();
    setBudget("food", 100);
    removeBudget("food");
    expect(useFinanceStore.getState().budgets).toEqual([]);
  });
});

describe("resetAll", () => {
  it("clears transactions and budgets but keeps categories", () => {
    const state = useFinanceStore.getState();
    state.addTransaction(base);
    state.setBudget("food", 100);

    useFinanceStore.getState().resetAll();

    const after = useFinanceStore.getState();
    expect(after.transactions).toEqual([]);
    expect(after.budgets).toEqual([]);
    expect(after.categories).toEqual(defaultCategories);
  });
});
describe("restore actions", () => {
  it("restores a deleted transaction at its original position", () => {
    const { addTransaction } = useFinanceStore.getState();
    addTransaction({ ...base, title: "A" });
    addTransaction({ ...base, title: "B" });
    addTransaction({ ...base, title: "C" });

    const middle = useFinanceStore.getState().transactions[1];
    useFinanceStore.getState().deleteTransaction(middle.id);
    useFinanceStore.getState().restoreTransaction(middle, 1);

    const titles = useFinanceStore.getState().transactions.map((t) => t.title);
    expect(titles).toEqual(["C", "B", "A"]);
  });

  it("does not duplicate a transaction when restored twice", () => {
    useFinanceStore.getState().addTransaction(base);
    const [t] = useFinanceStore.getState().transactions;

    useFinanceStore.getState().restoreTransaction(t, 0);
    expect(useFinanceStore.getState().transactions).toHaveLength(1);
  });

  it("restores a removed budget", () => {
    const { setBudget, removeBudget, restoreBudget } =
      useFinanceStore.getState();
    setBudget("food", 100);
    removeBudget("food");
    restoreBudget({ categoryId: "food", limit: 100 });

    expect(useFinanceStore.getState().budgets).toEqual([
      { categoryId: "food", limit: 100 },
    ]);
  });
});
describe("categories", () => {
  const custom = { name: "Gym", type: "expense" as const, color: "#14b8a6" };

  it("adds a custom category with a generated id", () => {
    useFinanceStore.getState().addCategory(custom);
    const added = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym");
    expect(added?.id).toBeTruthy();
  });

  it("updates name and color of a custom category", () => {
    useFinanceStore.getState().addCategory(custom);
    const { id } = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym")!;
    useFinanceStore
      .getState()
      .updateCategory(id, { name: "Fitness", color: "#000000" });

    const updated = useFinanceStore
      .getState()
      .categories.find((c) => c.id === id);
    expect(updated).toMatchObject({
      name: "Fitness",
      color: "#000000",
      type: "expense",
    });
  });

  it("does not modify or delete default categories", () => {
    useFinanceStore.getState().updateCategory("food", { name: "Hacked" });
    useFinanceStore.getState().deleteCategory("food");

    const food = useFinanceStore
      .getState()
      .categories.find((c) => c.id === "food");
    expect(food?.name).toBe("Food");
  });

  it("deletes an unused category together with its budget", () => {
    useFinanceStore.getState().addCategory(custom);
    const { id } = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym")!;
    useFinanceStore.getState().setBudget(id, 100);

    useFinanceStore.getState().deleteCategory(id);

    const state = useFinanceStore.getState();
    expect(state.categories.some((c) => c.id === id)).toBe(false);
    expect(state.budgets).toEqual([]);
  });

  it("refuses to delete a category that has transactions", () => {
    useFinanceStore.getState().addCategory(custom);
    const { id } = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym")!;
    useFinanceStore.getState().addTransaction({ ...base, categoryId: id });

    useFinanceStore.getState().deleteCategory(id);

    expect(useFinanceStore.getState().categories.some((c) => c.id === id)).toBe(
      true,
    );
  });

  it("restores a deleted category only once", () => {
    useFinanceStore.getState().addCategory(custom);
    const category = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym")!;
    useFinanceStore.getState().deleteCategory(category.id);

    useFinanceStore.getState().restoreCategory(category);
    useFinanceStore.getState().restoreCategory(category);

    const matches = useFinanceStore
      .getState()
      .categories.filter((c) => c.id === category.id);
    expect(matches).toHaveLength(1);
  });
});

describe("bulk actions", () => {
  it("adds many transactions and returns their ids", () => {
    const ids = useFinanceStore.getState().addTransactions([
      { ...base, title: "One" },
      { ...base, title: "Two" },
    ]);

    const { transactions } = useFinanceStore.getState();
    expect(ids).toHaveLength(2);
    expect(transactions.map((t) => t.id)).toEqual(ids);
  });

  it("deletes only the given ids", () => {
    useFinanceStore.getState().addTransaction({ ...base, title: "Keep" });
    const ids = useFinanceStore.getState().addTransactions([
      { ...base, title: "X" },
      { ...base, title: "Y" },
    ]);

    useFinanceStore.getState().deleteTransactions(ids);

    const titles = useFinanceStore.getState().transactions.map((t) => t.title);
    expect(titles).toEqual(["Keep"]);
  });
});

describe("recurring rules", () => {
  const ruleData = {
    title: "Netflix",
    amount: 10,
    type: "expense" as const,
    categoryId: "entertainment",
    frequency: "monthly" as const,
    startDate: "2026-09-15",
  };

  it("generates missed transactions once and advances the counter", () => {
    useFinanceStore.setState({ recurringRules: [makeRule()] });

    expect(useFinanceStore.getState().processRecurring("2026-11-18")).toBe(3);

    const state = useFinanceStore.getState();
    expect(state.transactions.map((t) => t.date).sort()).toEqual([
      "2026-09-15",
      "2026-10-15",
      "2026-11-15",
    ]);
    expect(
      state.transactions.every(
        (t) => t.recurringId === state.recurringRules[0].id,
      ),
    ).toBe(true);
    expect(state.recurringRules[0].occurrences).toBe(3);

    expect(useFinanceStore.getState().processRecurring("2026-11-18")).toBe(0);
    expect(useFinanceStore.getState().transactions).toHaveLength(3);
  });

  it("creates the first occurrence immediately when a rule starts today", () => {
    useFinanceStore
      .getState()
      .addRecurringRule({ ...ruleData, startDate: today() });

    const { transactions, recurringRules } = useFinanceStore.getState();
    expect(transactions).toHaveLength(1);
    expect(transactions[0].date).toBe(today());
    expect(recurringRules[0].occurrences).toBe(1);
  });

  it("skips paused rules and does not backfill the pause period on resume", () => {
    useFinanceStore.setState({ recurringRules: [makeRule({ active: false })] });
    expect(useFinanceStore.getState().processRecurring("2026-11-18")).toBe(0);

    const rule = useFinanceStore.getState().recurringRules[0];
    useFinanceStore.getState().toggleRecurringRule(rule.id);

    const resumed = useFinanceStore.getState().recurringRules[0];
    expect(resumed.active).toBe(true);
    expect(resumed.occurrences).toBe(
      countOccurrencesBefore(rule.startDate, rule.frequency, today()),
    );
  });

  it("keeps generated transactions when a rule is deleted, and restores it once", () => {
    useFinanceStore.setState({ recurringRules: [makeRule()] });
    useFinanceStore.getState().processRecurring("2026-11-18");

    const rule = useFinanceStore.getState().recurringRules[0];
    useFinanceStore.getState().deleteRecurringRule(rule.id);

    expect(useFinanceStore.getState().recurringRules).toEqual([]);
    expect(useFinanceStore.getState().transactions).toHaveLength(3);

    useFinanceStore.getState().restoreRecurringRule(rule);
    useFinanceStore.getState().restoreRecurringRule(rule);
    expect(useFinanceStore.getState().recurringRules).toHaveLength(1);
  });

  it("refuses to delete a category used by a rule", () => {
    useFinanceStore
      .getState()
      .addCategory({ name: "Gym", type: "expense", color: "#14b8a6" });
    const { id } = useFinanceStore
      .getState()
      .categories.find((c) => c.name === "Gym")!;
    useFinanceStore.setState({
      recurringRules: [makeRule({ categoryId: id })],
    });

    useFinanceStore.getState().deleteCategory(id);

    expect(useFinanceStore.getState().categories.some((c) => c.id === id)).toBe(
      true,
    );
  });
});