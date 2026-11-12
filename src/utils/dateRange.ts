import type { Transaction } from "../types";

export type RangeKey = "month" | "30days" | "all";

export const rangeOptions: { value: RangeKey; label: string }[] = [
  { value: "month", label: "This month" },
  { value: "30days", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function filterByRange(
  transactions: Transaction[],
  range: RangeKey,
  now: Date = new Date(),
): Transaction[] {
  if (range === "all") return transactions;

  let from: string;
  if (range === "month") {
    from = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
  } else {
    const d = new Date(now);
    d.setDate(d.getDate() - 30);
    from = toISODate(d);
  }

  const to = toISODate(now);
  return transactions.filter(t => t.date >= from && t.date <= to);
}
