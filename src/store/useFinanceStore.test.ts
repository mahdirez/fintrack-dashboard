import { useFinanceStore } from "./useFinanceStore";
import { defaultCategories } from "../utils/defaultCategories";

const initialState = {
  transactions: [],
  categories: defaultCategories,
  budgets: [],
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