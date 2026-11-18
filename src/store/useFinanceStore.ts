import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Budget, Category, Transaction, RecurringRule } from "../types";
import {
  defaultCategories,
  defaultCategoryIds,
} from "../utils/defaultCategories";
import { today } from "../utils/format";
import { countOccurrencesBefore, getDueOccurrences } from "../utils/recurring";

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
  recurringRules: RecurringRule[];

  addRecurringRule: (
    data: Omit<RecurringRule, "id" | "active" | "occurrences">,
  ) => void;
  updateRecurringRule: (
    id: string,
    data: Partial<
      Pick<
        RecurringRule,
        "title" | "amount" | "categoryId" | "note" | "endDate"
      >
    >,
  ) => void;
  toggleRecurringRule: (id: string) => void;
  deleteRecurringRule: (id: string) => void;
  restoreRecurringRule: (rule: RecurringRule) => void;
  processRecurring: (todayISO?: string) => number;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      transactions: [],
      categories: defaultCategories,
      budgets: [],
      recurringRules: [],

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
      resetAll: () =>
        set({ transactions: [], budgets: [], recurringRules: [] }),
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
          if (defaultCategoryIds.has(id)) return state;
          if (state.transactions.some((t) => t.categoryId === id)) return state;
          if (state.recurringRules.some((r) => r.categoryId === id))
            return state;
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
      addRecurringRule: (data) => {
        set((state) => ({
          recurringRules: [
            ...state.recurringRules,
            { id: crypto.randomUUID(), active: true, occurrences: 0, ...data },
          ],
        }));
        get().processRecurring();
      },

      updateRecurringRule: (id, data) =>
        set((state) => ({
          recurringRules: state.recurringRules.map((r) =>
            r.id === id ? { ...r, ...data } : r,
          ),
        })),

      toggleRecurringRule: (id) =>
        set((state) => ({
          recurringRules: state.recurringRules.map((r) => {
            if (r.id !== id) return r;
            if (r.active) return { ...r, active: false };
            const skipTo = countOccurrencesBefore(
              r.startDate,
              r.frequency,
              today(),
            );
            return {
              ...r,
              active: true,
              occurrences: Math.max(r.occurrences, skipTo),
            };
          }),
        })),

      deleteRecurringRule: (id) =>
        set((state) => ({
          recurringRules: state.recurringRules.filter((r) => r.id !== id),
        })),

      restoreRecurringRule: (rule) =>
        set((state) =>
          state.recurringRules.some((r) => r.id === rule.id)
            ? state
            : { recurringRules: [...state.recurringRules, rule] },
        ),

      processRecurring: (todayISO = today()) => {
        const created: Transaction[] = [];

        const rules = get().recurringRules.map((rule) => {
          const dates = getDueOccurrences(rule, todayISO);
          if (dates.length === 0) return rule;

          for (const date of dates) {
            created.push({
              id: crypto.randomUUID(),
              title: rule.title,
              amount: rule.amount,
              type: rule.type,
              categoryId: rule.categoryId,
              note: rule.note,
              date,
              recurringId: rule.id,
            });
          }
          return { ...rule, occurrences: rule.occurrences + dates.length };
        });

        if (created.length === 0) return 0;

        set((state) => ({
          recurringRules: rules,
          transactions: [...created, ...state.transactions],
        }));
        return created.length;
      },
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
        recurringRules: state.recurringRules,
      }),

      merge: (persisted, current) => {
        const p = (persisted ?? {}) as {
          transactions?: Transaction[];
          budgets?: Budget[];
          customCategories?: Category[];
          recurringRules?: RecurringRule[];
        };
        return {
          ...current,
          transactions: p.transactions ?? current.transactions,
          budgets: p.budgets ?? current.budgets,
          recurringRules: p.recurringRules ?? current.recurringRules,
          categories: [...defaultCategories, ...(p.customCategories ?? [])],
        };
      },
    },
  ),
);
