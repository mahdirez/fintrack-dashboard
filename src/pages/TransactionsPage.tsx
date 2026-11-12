import { useState } from "react";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import { useFinanceStore } from "../store/useFinanceStore";
import { formatCurrency } from "../utils/format";

export default function TransactionsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const transactions = useFinanceStore(s => s.transactions);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Transaction
        </button>
      </div>

      <ul className="mt-6 space-y-2">
        {transactions.map(t => (
          <li key={t.id} className="rounded-lg bg-white p-3 shadow-sm">
            {t.title}: {formatCurrency(t.amount)} ({t.type})
          </li>
        ))}
      </ul>

      <Modal
        open={isOpen}
        title="New Transaction"
        onClose={() => setIsOpen(false)}
      >
        <TransactionForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
