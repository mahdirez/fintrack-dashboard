import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { budgetSchema, type BudgetFormValues } from "../schemas/budgetSchema";
import { useFinanceStore } from "../store/useFinanceStore";

interface Props {
  editingCategoryId?: string;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-100";

export default function BudgetForm({ editingCategoryId, onSuccess }: Props) {
  const categories = useFinanceStore((s) => s.categories);
  const budgets = useFinanceStore((s) => s.budgets);
  const setBudget = useFinanceStore((s) => s.setBudget);

  const isEditing = Boolean(editingCategoryId);

  const availableCategories = categories.filter((c) => {
    if (c.type !== "expense") return false;
    if (isEditing) return c.id === editingCategoryId;
    return !budgets.some((b) => b.categoryId === c.id);
  });
  const existing = budgets.find((b) => b.categoryId === editingCategoryId);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BudgetFormValues>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      categoryId: editingCategoryId ?? "",
      limit: existing?.limit,
    },
  });

  const onSubmit = (values: BudgetFormValues) => {
    setBudget(values.categoryId, values.limit);
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select
          {...register("categoryId")}
          //   disabled={isEditing}
          className={inputClass}
        >
          <option value="">Select a category</option>
          {availableCategories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="mt-1 text-xs text-red-600">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Monthly limit</label>
        <input
          type="number"
          step="0.01"
          {...register("limit", { valueAsNumber: true })}
          className={inputClass}
          placeholder="0.00"
        />
        {errors.limit && (
          <p className="mt-1 text-xs text-red-600">{errors.limit.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {isEditing ? "Save Changes" : "Set Budget"}
      </button>
    </form>
  );
}
