import { useMemo, useState } from "react";
import Modal from "../components/Modal";
import RecurringForm from "../components/RecurringForm";
import { useFinanceStore } from "../store/useFinanceStore";
import { useToastStore } from "../store/useToastStore";
import type { RecurringRule } from "../types";
import { formatCurrency, formatDate } from "../utils/format";
import {
  frequencyLabels,
  getNextDate,
  getRuleStatus,
} from "../utils/recurring";

export default function RecurringPage() {
  const rules = useFinanceStore((s) => s.recurringRules);
  const categories = useFinanceStore((s) => s.categories);
  const toggleRule = useFinanceStore((s) => s.toggleRecurringRule);
  const deleteRule = useFinanceStore((s) => s.deleteRecurringRule);
  const restoreRule = useFinanceStore((s) => s.restoreRecurringRule);
  const showToast = useToastStore((s) => s.showToast);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<RecurringRule | null>(null);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const openAdd = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (rule: RecurringRule) => {
    setEditing(rule);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (rule: RecurringRule) => {
    deleteRule(rule.id);
    showToast({
      message: `Rule "${rule.title}" deleted`,
      actionLabel: "Undo",
      onAction: () => restoreRule(rule),
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Recurring</h2>
          <p className="mt-1 text-sm text-gray-500">
            Transactions are created automatically when the app opens.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Recurring
        </button>
      </div>

      {rules.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="font-medium text-gray-700">No recurring transactions</p>
          <p className="mt-1 text-sm text-gray-500">
            Add subscriptions, rent or salary so you don't have to enter them
            every time.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rules.map((rule) => {
            const category = categoryMap.get(rule.categoryId);
            const status = getRuleStatus(rule);
            const next = getNextDate(rule);
            const isIncome = rule.type === "income";

            const statusText =
              status === "active" && next
                ? `Next: ${formatDate(next)}`
                : status === "paused"
                  ? "Paused"
                  : "Ended";

            return (
              <li
                key={rule.id}
                className={`flex flex-wrap items-center gap-4 rounded-xl bg-white p-4 shadow-sm ${
                  status === "active" ? "" : "opacity-70"
                }`}
              >
                <span
                  className="h-10 w-10 shrink-0 rounded-full"
                  style={{ backgroundColor: category?.color ?? "#9ca3af" }}
                  aria-hidden="true"
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-gray-900">
                    {rule.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {category?.name ?? "Unknown"} ·{" "}
                    {frequencyLabels[rule.frequency]} · {statusText}
                  </p>
                </div>

                <p
                  className={`shrink-0 font-semibold ${
                    isIncome ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isIncome ? "+" : "-"}
                  {formatCurrency(rule.amount)}
                </p>

                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => toggleRule(rule.id)}
                    aria-label={`${rule.active ? "Pause" : "Resume"} ${rule.title}`}
                    className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
                  >
                    {rule.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    onClick={() => openEdit(rule)}
                    aria-label={`Edit ${rule.title}`}
                    className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(rule)}
                    aria-label={`Delete ${rule.title}`}
                    className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={isFormOpen}
        title={editing ? "Edit Recurring" : "New Recurring"}
        onClose={closeForm}
      >
        <RecurringForm rule={editing ?? undefined} onSuccess={closeForm} />
      </Modal>
    </div>
  );
}
