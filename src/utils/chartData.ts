import type { Category, Transaction } from "../types";

export interface CategoryDatum {
  id: string;
  name: string;
  value: number;
  color: string;
}

export interface MonthlyDatum {
  month: string;
  income: number;
  expense: number;
}

export function getExpenseByCategory(
  transactions: Transaction[],
  categories: Category[],
): CategoryDatum[] {
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const totals = new Map<string, number>();

  for (const t of transactions) {
    if (t.type !== "expense") continue;
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
  }

  return [...totals.entries()]
    .map(([id, value]) => {
      const category = categoryMap.get(id);
      return {
        id,
        name: category?.name ?? "Unknown",
        color: category?.color ?? "#9ca3af",
        value,
      };
    })
    .sort((a, b) => b.value - a.value);
}

export function getMonthlyTotals(
  transactions: Transaction[],
  monthsCount = 6,
  now: Date = new Date(),
): MonthlyDatum[] {
  const buckets: { key: string; datum: MonthlyDatum }[] = [];

  for (let i = monthsCount - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const month = d.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
    buckets.push({ key, datum: { month, income: 0, expense: 0 } });
  }

  const bucketMap = new Map(buckets.map((b) => [b.key, b.datum]));

  for (const t of transactions) {
    const datum = bucketMap.get(t.date.slice(0, 7));
    if (!datum) continue;
    if (t.type === "income") datum.income += t.amount;
    else datum.expense += t.amount;
  }

  return buckets.map((b) => b.datum);
}
