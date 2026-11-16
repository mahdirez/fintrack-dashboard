import { useMemo, useState } from "react";
import CategoryForm from "../components/CategoryForm";
import Modal from "../components/Modal";
import { useFinanceStore } from "../store/useFinanceStore";
import { useToastStore } from "../store/useToastStore";
import type { Category } from "../types";
import { getCategoryUsage } from "../utils/categories";
import { defaultCategoryIds } from "../utils/defaultCategories";

export default function CategoriesPage() {
  const categories = useFinanceStore((s) => s.categories);
  const transactions = useFinanceStore((s) => s.transactions);
  const budgets = useFinanceStore((s) => s.budgets);
  const deleteCategory = useFinanceStore((s) => s.deleteCategory);
  const restoreCategory = useFinanceStore((s) => s.restoreCategory);
  const restoreBudget = useFinanceStore((s) => s.restoreBudget);
  const showToast = useToastStore((s) => s.showToast);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  const usage = useMemo(() => getCategoryUsage(transactions), [transactions]);

  const openAdd = () => {
    setEditing(null);
    setIsFormOpen(true);
  };

  const openEdit = (category: Category) => {
    setEditing(category);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditing(null);
  };

  const handleDelete = (category: Category) => {
    if ((usage.get(category.id) ?? 0) > 0) return;
    const budget = budgets.find((b) => b.categoryId === category.id);

    deleteCategory(category.id);
    showToast({
      message: `Category "${category.name}" deleted`,
      actionLabel: "Undo",
      onAction: () => {
        restoreCategory(category);
        if (budget) restoreBudget(budget);
      },
    });
  };

  const sections = [
    {
      title: "Expense categories",
      items: categories.filter((c) => c.type === "expense"),
    },
    {
      title: "Income categories",
      items: categories.filter((c) => c.type === "income"),
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Categories</h2>
          <p className="mt-1 text-sm text-gray-500">
            Default categories are fixed. Custom ones can be edited or deleted.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          + Add Category
        </button>
      </div>

      {sections.map((section) => (
        <section key={section.title} className="mt-8">
          <h3 className="text-lg font-semibold">{section.title}</h3>
          <ul className="mt-3 divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
            {section.items.map((c) => {
              const count = usage.get(c.id) ?? 0;
              const isDefault = defaultCategoryIds.has(c.id);

              return (
                <li key={c.id} className="flex items-center gap-3 p-4">
                  <span
                    className="h-6 w-6 shrink-0 rounded-full"
                    style={{ backgroundColor: c.color }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{c.name}</p>
                    <p className="text-xs text-gray-500">
                      {count} {count === 1 ? "transaction" : "transactions"}
                    </p>
                  </div>

                  {isDefault ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                      Default
                    </span>
                  ) : (
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.name}`}
                        className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        disabled={count > 0}
                        title={
                          count > 0
                            ? "Category is used by transactions"
                            : undefined
                        }
                        aria-label={`Delete ${c.name}`}
                        className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-gray-500"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      <Modal
        open={isFormOpen}
        title={editing ? "Edit Category" : "New Category"}
        onClose={closeForm}
      >
        <CategoryForm category={editing ?? undefined} onSuccess={closeForm} />
      </Modal>
    </div>
  );
}
