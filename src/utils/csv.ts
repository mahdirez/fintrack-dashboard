import type { Category, Transaction } from "../types";

const HEADERS = ["Date", "Title", "Type", "Category", "Amount", "Note"];

function neutralizeFormula(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

function escapeCell(value: string): string {
  const safe = neutralizeFormula(value);
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

export function transactionsToCSV(
  transactions: Transaction[],
  categories: Category[],
): string {
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  const rows = transactions.map((t) => [
    t.date,
    t.title,
    t.type,
    categoryMap.get(t.categoryId) ?? "Unknown",
    t.amount.toFixed(2),
    t.note ?? "",
  ]);

  const lines = [HEADERS, ...rows].map((row, index) =>
    row
      .map((cell, col) => {
        if (index > 0 && col === 4) return cell;
        return escapeCell(cell);
      })
      .join(","),
  );

  return lines.join("\r\n");
}
