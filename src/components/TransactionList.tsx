import { useMemo } from "react";
import type { Category, Transaction } from "../types";
import TransactionItem from "./TransactionItem";

interface TransactionListProps {
  transactions: Transaction[];
  categories: Category[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionList({
  transactions,
  categories,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const categoryMap = useMemo(
    () => new Map(categories.map(c => [c.id, c])),
    [categories],
  );

  const sorted = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)),
    [transactions],
  );

  if (sorted.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
        <p className="font-medium text-gray-700">No transactions yet</p>
        <p className="mt-1 text-sm text-gray-500">
          Click "Add Transaction" to record your first one.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {sorted.map(t => (
        <TransactionItem
          key={t.id}
          transaction={t}
          category={categoryMap.get(t.categoryId)}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
