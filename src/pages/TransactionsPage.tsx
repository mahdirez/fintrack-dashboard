import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import { useFinanceStore } from "../store/useFinanceStore";
import { useMemo, useState } from "react";
import TransactionFiltersBar from "../components/TransactionFiltersBar";
import { useDebounce } from "../hooks/useDebounce";
import {
  defaultFilters,
  filterTransactions,
  hasActiveFilters,
} from "../utils/filterTransactions";
import type { Transaction, TransactionFilters } from "../types";
import { transactionsToCSV } from "../utils/csv";
import { downloadFile } from "../utils/download";
import { today } from "../utils/format";

export default function TransactionsPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const deleteTransaction = useFinanceStore((s) => s.deleteTransaction);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [deleting, setDeleting] = useState<Transaction | null>(null);
  const [filters, setFilters] = useState<TransactionFilters>(defaultFilters);
  const debouncedSearch = useDebounce(filters.search, 300);

  const filtered = useMemo(
    () =>
      filterTransactions(transactions, { ...filters, search: debouncedSearch }),
    [transactions, filters, debouncedSearch],
  );
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

  const handleExport = () => {
    const csv = transactionsToCSV(filtered, categories);
    downloadFile(csv, `fintrack-transactions-${today()}.csv`, "text/csv");
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Transactions</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export CSV
          </button>
          <button
            onClick={openAdd}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            + Add Transaction
          </button>
        </div>
      </div>

      <TransactionFiltersBar
        filters={filters}
        categories={categories}
        onChange={setFilters}
      />

      <p className="mt-4 text-sm text-gray-500">
        Showing {filtered.length} of {transactions.length} transactions
      </p>

      <TransactionList
        transactions={filtered}
        categories={categories}
        onEdit={openEdit}
        onDelete={setDeleting}
        isFiltered={hasActiveFilters(filters)}
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
