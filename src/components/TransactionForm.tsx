import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  type TransactionFormValues,
} from "../schemas/transactionSchema";
import { useFinanceStore } from "../store/useFinanceStore";
import { today } from "../utils/format";
import type { Transaction } from "../types";

interface TransactionFormProps {
  onSuccess: () => void;
}
interface TransactionFormProps {
  transaction?: Transaction;
  onSuccess: () => void;
}
const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function TransactionForm({
  onSuccess,
  transaction,
}: TransactionFormProps) {
  const categories = useFinanceStore((s) => s.categories);
  const addTransaction = useFinanceStore((s) => s.addTransaction);
  const updateTransaction = useFinanceStore((s) => s.updateTransaction);

  const isEditing = Boolean(transaction);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      title: transaction?.title ?? "",
      amount: transaction?.amount,
      type: transaction?.type ?? "expense",
      categoryId: transaction?.categoryId ?? "",
      date: transaction?.date ?? today(),
      note: transaction?.note ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const filteredCategories = categories.filter((c) => c.type === type);

  const onSubmit = (values: TransactionFormValues) => {
    const data = { ...values, note: values.note || undefined };

    if (transaction) {
      updateTransaction(transaction.id, data);
    } else {
      addTransaction(data);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {/* Type toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["expense", "income"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => {
              setValue("type", t);
              setValue("categoryId", "");
            }}
            className={`rounded-lg py-2 text-sm font-medium capitalize transition-colors ${
              type === t
                ? t === "expense"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="e.g. Grocery shopping"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Amount */}
      <div>
        <label className="mb-1 block text-sm font-medium">Amount</label>
        <input
          type="number"
          step="0.01"
          {...register("amount", { valueAsNumber: true })}
          className={inputClass}
          placeholder="0.00"
        />
        {errors.amount && (
          <p className="mt-1 text-xs text-red-600">{errors.amount.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label className="mb-1 block text-sm font-medium">Category</label>
        <select {...register("categoryId")} className={inputClass}>
          <option value="">Select a category</option>
          {filteredCategories.map((c) => (
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

      {/* Date */}
      <div>
        <label className="mb-1 block text-sm font-medium">Date</label>
        <input type="date" {...register("date")} className={inputClass} />
        {errors.date && (
          <p className="mt-1 text-xs text-red-600">{errors.date.message}</p>
        )}
      </div>

      {/* Note */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Note <span className="text-gray-400">(optional)</span>
        </label>
        <textarea {...register("note")} rows={2} className={inputClass} />
        {errors.note && (
          <p className="mt-1 text-xs text-red-600">{errors.note.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {isEditing ? "Save Changes" : "Add Transaction"}
      </button>
    </form>
  );
}
