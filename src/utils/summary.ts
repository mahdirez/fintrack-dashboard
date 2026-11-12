import type { Transaction } from "../types";

export interface Summary {
  income: number;
  expense: number;
  balance: number;
}

export function calculateSummary(transactions: Transaction[]): Summary {
  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }

  return { income, expense, balance: income - expense };
}
