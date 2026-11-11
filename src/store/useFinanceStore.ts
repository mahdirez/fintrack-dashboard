import { create } from "zustand";
import type { Budget, Category, Transaction } from "../types";
import { defaultCategories } from "../utils/defaultCategories";

interface FinanceState {
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];

  addTransaction: (data: Omit<Transaction, "id">) => void;
  updateTransaction: (
    id: string,
    data: Partial<Omit<Transaction, "id">>,
  ) => void;
  deleteTransaction: (id: string) => void;

  setBudget: (categoryId: string, limit: number) => void;
  removeBudget: (categoryId: string) => void;
}

export const useFinanceStore = create<FinanceState>(set => ({
  transactions: [],
  categories: defaultCategories,
  budgets: [],

  addTransaction: data =>
    set(state => ({
      transactions: [
        { id: crypto.randomUUID(), ...data },
        ...state.transactions,
      ],
    })),

  updateTransaction: (id, data) =>
    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, ...data } : t,
      ),
    })),

  deleteTransaction: id =>
    set(state => ({
      transactions: state.transactions.filter(t => t.id !== id),
    })),

  setBudget: (categoryId, limit) =>
    set(state => {
      const exists = state.budgets.some(b => b.categoryId === categoryId);
      return {
        budgets: exists
          ? state.budgets.map(b =>
              b.categoryId === categoryId ? { ...b, limit } : b,
            )
          : [...state.budgets, { categoryId, limit }],
      };
    }),

  removeBudget: categoryId =>
    set(state => ({
      budgets: state.budgets.filter(b => b.categoryId !== categoryId),
    })),
}));
