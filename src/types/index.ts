export type TransactionType = "income" | "expense";

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  date: string;
  note?: string;
  recurringId?: string;
}

export interface Budget {
  categoryId: string;
  limit: number;
}

export interface TransactionFilters {
  search: string;
  type: TransactionType | "all";
  categoryId: string;
  dateFrom: string;
  dateTo: string;
}

export type Frequency = "weekly" | "monthly" | "yearly";

export interface RecurringRule {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  note?: string;
  frequency: Frequency;
  startDate: string;
  endDate?: string;
  active: boolean;
  occurrences: number;
}
