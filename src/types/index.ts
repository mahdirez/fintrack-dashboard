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
}

export interface Budget {
  categoryId: string;
  limit: number;
}
