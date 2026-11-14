import type { Transaction } from "../types";

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
