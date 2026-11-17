import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget, Category, Transaction } from "../types";
import {
  defaultCategories,
  defaultCategoryIds,
} from "../utils/defaultCategories";

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
  resetAll: () => void;
  restoreTransaction: (transaction: Transaction, index?: number) => void;
  restoreBudget: (budget: Budget) => void;
  addCategory: (data: Omit<Category, "id">) => void;
  updateCategory: (
    id: string,
    data: Partial<Pick<Category, "name" | "color">>,
  ) => void;
  deleteCategory: (id: string) => void;
  restoreCategory: (category: Category) => void;
  addTransactions: (data: Omit<Transaction, "id">[]) => string[];
  deleteTransactions: (ids: string[]) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],

      addTransaction: (data) =>
        set((state) => ({
          transactions: [
            { id: crypto.randomUUID(), ...data },
            ...state.transactions,
          ],
        })),

      updateTransaction: (id, data) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...data } : t,
          ),
        })),

      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),

      addTransactions: (data) => {
        const created = data.map((d) => ({ id: crypto.randomUUID(), ...d }));
        set((state) => ({ transactions: [...created, ...state.transactions] }));
        return created.map((t) => t.id);
      },

      deleteTransactions: (ids) =>
        set((state) => {
          const toDelete = new Set(ids);
          return {
            transactions: state.transactions.filter((t) => !toDelete.has(t.id)),
          };
        }),

      setBudget: (categoryId, limit) =>
        set((state) => {
          const exists = state.budgets.some((b) => b.categoryId === categoryId);
          return {
            budgets: exists
              ? state.budgets.map((b) =>
                  b.categoryId === categoryId ? { ...b, limit } : b,
                )
              : [...state.budgets, { categoryId, limit }],
          };
        }),

      removeBudget: (categoryId) =>
        set((state) => ({
          budgets: state.budgets.filter((b) => b.categoryId !== categoryId),
        })),
      restoreTransaction: (transaction, index = 0) =>
        set((state) => {
          if (state.transactions.some((t) => t.id === transaction.id))
            return state;
          const next = [...state.transactions];
          next.splice(Math.min(index, next.length), 0, transaction);
          return { transactions: next };
        }),

      restoreBudget: (budget) =>
        set((state) =>
          state.budgets.some((b) => b.categoryId === budget.categoryId)
            ? state
            : { budgets: [...state.budgets, budget] },
        ),
      resetAll: () => set({ transactions: [], budgets: [] }),
      addCategory: (data) =>
        set((state) => ({
          categories: [
            ...state.categories,
            { id: crypto.randomUUID(), ...data },
          ],
        })),

      updateCategory: (id, data) =>
        set((state) => {
          if (defaultCategoryIds.has(id)) return state;
          return {
            categories: state.categories.map((c) =>
              c.id === id ? { ...c, ...data } : c,
            ),
          };
        }),

      deleteCategory: (id) =>
        set((state) => {
          // پیش‌فرض‌ها و دسته‌های دارای تراکنش حذف نمی‌شن
          if (defaultCategoryIds.has(id)) return state;
          if (state.transactions.some((t) => t.categoryId === id)) return state;
          return {
            categories: state.categories.filter((c) => c.id !== id),
            budgets: state.budgets.filter((b) => b.categoryId !== id),
          };
        }),

      restoreCategory: (category) =>
        set((state) =>
          state.categories.some((c) => c.id === category.id)
            ? state
            : { categories: [...state.categories, category] },
        ),
    }),
    {
      name: "fintrack-storage",
      version: 1,

      partialize: (state) => ({
        transactions: state.transactions,
        budgets: state.budgets,
        customCategories: state.categories.filter(
          (c) => !defaultCategoryIds.has(c.id),
        ),
      }),

      merge: (persisted, current) => {
        const p = (persisted ?? {}) as {
          transactions?: Transaction[];
          budgets?: Budget[];
          customCategories?: Category[];
        };
        return {
          ...current,
          transactions: p.transactions ?? current.transactions,
          budgets: p.budgets ?? current.budgets,
          categories: [...defaultCategories, ...(p.customCategories ?? [])],
        };
      },
    },
  ),
);
