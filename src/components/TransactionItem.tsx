import type { Category, Transaction } from "../types";
import { formatCurrency, formatDate } from "../utils/format";

interface TransactionItemProps {
  transaction: Transaction;
  category?: Category;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export default function TransactionItem({
  transaction,
  category,
  onEdit,
  onDelete,
}: TransactionItemProps) {
  const isIncome = transaction.type === "income";

  return (
    <li className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
      <span
        className="h-10 w-10 shrink-0 rounded-full"
        style={{ backgroundColor: category?.color ?? "#9ca3af" }}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-gray-900">
          {transaction.title}
        </p>
        <p className="text-xs text-gray-500">
          {category?.name ?? "Unknown"} · {formatDate(transaction.date)}
        </p>
        {transaction.note && (
          <p className="mt-1 truncate text-xs text-gray-400">
            {transaction.note}
          </p>
        )}
      </div>

      <p
        className={`shrink-0 font-semibold ${
          isIncome ? "text-green-600" : "text-red-600"
        }`}
      >
        {isIncome ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </p>

      <div className="flex shrink-0 flex-col gap-0.5 sm:flex-row sm:gap-1">
        <button
          onClick={() => onEdit(transaction)}
          aria-label={`Edit ${transaction.title}`}
          className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(transaction)}
          aria-label={`Delete ${transaction.title}`}
          className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
        >
          Delete
        </button>
      </div>
    </li>
  );
}
