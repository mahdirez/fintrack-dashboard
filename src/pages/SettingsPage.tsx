import { useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import { useFinanceStore } from "../store/useFinanceStore";

export default function SettingsPage() {
  const transactionsCount = useFinanceStore((s) => s.transactions.length);
  const budgetsCount = useFinanceStore((s) => s.budgets.length);
  const resetAll = useFinanceStore((s) => s.resetAll);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const isEmpty = transactionsCount === 0 && budgetsCount === 0;

  const handleReset = () => {
    resetAll();
    setConfirmOpen(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold">Settings</h2>

      <section className="mt-6 rounded-xl bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold">Your data</h3>
        <p className="mt-1 text-sm text-gray-500">
          Everything is stored locally in your browser.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-gray-500">Transactions</dt>
            <dd className="text-xl font-semibold">{transactionsCount}</dd>
          </div>
          <div>
            <dt className="text-gray-500">Budgets</dt>
            <dd className="text-xl font-semibold">{budgetsCount}</dd>
          </div>
        </dl>
      </section>

      <section className="mt-6 rounded-xl border border-red-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-red-600">Danger zone</h3>
        <p className="mt-1 text-sm text-gray-500">
          Permanently delete all transactions and budgets. This cannot be
          undone.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={isEmpty}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Reset all data
        </button>
      </section>

      <ConfirmDialog
        open={confirmOpen}
        title="Reset all data"
        message="All transactions and budgets will be permanently deleted. Are you sure?"
        confirmLabel="Reset"
        onConfirm={handleReset}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
