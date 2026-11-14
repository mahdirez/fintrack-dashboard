import type { Budget, Category, Transaction } from "../types";

export type BudgetStatus = "ok" | "warning" | "exceeded";

export interface BudgetProgress {
  category: Category;
  limit: number;
  spent: number;
  remaining: number;
  percent: number;
  status: BudgetStatus;
}

export const WARNING_THRESHOLD = 80;

export function getStatus(percent: number): BudgetStatus {
  if (percent >= 100) return "exceeded";
  if (percent >= WARNING_THRESHOLD) return "warning";
  return "ok";
}

export function getMonthlySpentByCategory(
  transactions: Transaction[],
  now: Date = new Date(),
): Map<string, number> {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spent = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    if (t.date.slice(0, 7) !== monthKey) continue;
    spent.set(t.categoryId, (spent.get(t.categoryId) ?? 0) + t.amount);
  }

  return spent;
}

export function getBudgetProgress(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[],
  now: Date = new Date(),
): BudgetProgress[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const spentMap = getMonthlySpentByCategory(transactions, now);

  const result: BudgetProgress[] = [];

  for (const b of budgets) {
    const category = categoryMap.get(b.categoryId);
    if (!category) continue;

    const spent = spentMap.get(b.categoryId) ?? 0;
    const percent = b.limit > 0 ? (spent / b.limit) * 100 : 0;

    result.push({
      category,
      limit: b.limit,
      spent,
      remaining: b.limit - spent,
      percent,
      status: getStatus(percent),
    });
  }

  return result.sort((a, b) => b.percent - a.percent);
}
