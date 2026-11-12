import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useFinanceStore } from "../store/useFinanceStore";
import type { Transaction } from "../types";

export default function TransactionsPage() {
  const transactions = useFinanceStore(s => s.transactions);
  const categories = useFinanceStore(s => s.categories);
  const deleteTransaction = useFinanceStore(s => s.deleteTransaction);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);

  const openAdd = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (transaction: Transaction) => {
    setEditing(transaction);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const confirmDelete = () => {
    if (deleting) deleteTransaction(deleting.id);
    setDeleting(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Transaction
        </button>
      </div>

      <TransactionList
        transactions={transactions}
        categories={categories}
        onEdit={openEdit}
        onDelete={setDeleting}
      />

      <Modal
        open={isFormOpen}
        title={editing ? "Edit Transaction" : "New Transaction"}
        onClose={closeForm}
      >
        <TransactionForm
          transaction={editing ?? undefined}
          onSuccess={closeForm}
        />
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete transaction"
        message={`Are you sure you want to delete "${deleting?.title}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
