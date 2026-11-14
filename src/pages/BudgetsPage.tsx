import { useMemo, useState } from "react";
import BudgetCard from "../components/BudgetCard";
import BudgetForm from "../components/BudgetForm";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import { useFinanceStore } from "../store/useFinanceStore";
import { getBudgetProgress } from "../utils/budget";

export default function BudgetsPage() {
  const budgets = useFinanceStore((s) => s.budgets);
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const removeBudget = useFinanceStore((s) => s.removeBudget);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const progress = useMemo(
    () => getBudgetProgress(budgets, categories, transactions),
    [budgets, categories, transactions],
  );

  const expenseCategoriesCount = categories.filter(
    (c) => c.type === "expense",
  ).length;
  const canAdd = budgets.length < expenseCategoriesCount;

  const openAdd = () => {
    setEditingId(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (categoryId: string) => {
    setEditingId(categoryId);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(undefined);
  };

  const removingName = categories.find((c) => c.id === removingId)?.name;

  const confirmRemove = () => {
    if (removingId) removeBudget(removingId);
    setRemovingId(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Budgets</h2>
          <p className="mt-1 text-sm text-gray-500">
            Monthly spending limits for the current month.
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={!canAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add Budget
        </button>
      </div>

      {progress.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-700">No budgets yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Set a monthly limit for a category to start tracking.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 lg:grid-cols-2">
          {progress.map((p) => (
            <BudgetCard
              key={p.category.id}
              progress={p}
              onEdit={() => openEdit(p.category.id)}
              onRemove={() => setRemovingId(p.category.id)}
            />
          ))}
        </ul>
      )}

      <Modal
        open={isFormOpen}
        title={editingId ? "Edit Budget" : "New Budget"}
        onClose={closeForm}
      >
        <BudgetForm editingCategoryId={editingId} onSuccess={closeForm} />
      </Modal>

      <ConfirmDialog
        open={removingId !== null}
        title="Remove budget"
        message={`Remove the budget for "${removingName}"? Your transactions won't be affected.`}
        confirmLabel="Remove"
        onConfirm={confirmRemove}
        onCancel={() => setRemovingId(null)}
      />
    </div>
  );
}
