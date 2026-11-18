import type { Transaction, RecurringRule } from "../types";

export function makeTransaction(
  overrides: Partial<Transaction> = {},
): Transaction {
  return {
    id: crypto.randomUUID(),
    title: "Test",
    amount: 100,
    type: "expense",
    categoryId: "food",
    date: "2026-11-10",
    ...overrides,
  };
}

export function makeRule(
  overrides: Partial<RecurringRule> = {},
): RecurringRule {
  return {
    id: crypto.randomUUID(),
    title: "Netflix",
    amount: 10,
    type: "expense",
    categoryId: "entertainment",
    frequency: "monthly",
    startDate: "2026-09-15",
    active: true,
    occurrences: 0,
    ...overrides,
  };
}