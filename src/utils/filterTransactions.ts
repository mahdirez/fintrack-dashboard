import type { Transaction, TransactionFilters } from "../types";

export const defaultFilters: TransactionFilters = {
  search: "",
  type: "all",
  categoryId: "all",
  dateFrom: "",
  dateTo: "",
};

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters,
): Transaction[] {
  const search = filters.search.trim().toLowerCase();

  return transactions.filter(t => {
    if (search && !t.title.toLowerCase().includes(search)) return false;
    if (filters.type !== "all" && t.type !== filters.type) return false;
    if (filters.categoryId !== "all" && t.categoryId !== filters.categoryId)
      return false;
    if (filters.dateFrom && t.date < filters.dateFrom) return false;
    if (filters.dateTo && t.date > filters.dateTo) return false;
    return true;
  });
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.search.trim() !== "" ||
    filters.type !== "all" ||
    filters.categoryId !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}
