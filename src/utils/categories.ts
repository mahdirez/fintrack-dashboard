import type { Category, Transaction, TransactionType } from "../types";

export const colorPalette = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#14b8a6",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#6b7280",
];

export function getCategoryUsage(
  transactions: Transaction[],
): Map<string, number> {
  const usage = new Map<string, number>();
  for (const t of transactions) {
    usage.set(t.categoryId, (usage.get(t.categoryId) ?? 0) + 1);
  }
  return usage;
}

export function isDuplicateCategoryName(
  categories: Category[],
  name: string,
  type: TransactionType,
  ignoreId?: string,
): boolean {
  const normalized = name.trim().toLowerCase();
  return categories.some(
    (c) =>
      c.id !== ignoreId &&
      c.type === type &&
      c.name.trim().toLowerCase() === normalized,
  );
}
