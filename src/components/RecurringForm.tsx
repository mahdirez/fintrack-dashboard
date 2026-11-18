import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  recurringSchema,
  type RecurringFormValues,
} from "../schemas/recurringSchema";
import { useFinanceStore } from "../store/useFinanceStore";
import type { RecurringRule } from "../types";
import { today } from "../utils/format";
import { frequencyLabels, frequencyOptions } from "../utils/recurring";

interface Props {
  rule?: RecurringRule;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function RecurringForm({ rule, onSuccess }: Props) {
  const categories = useFinanceStore((s) => s.categories);
  const addRecurringRule = useFinanceStore((s) => s.addRecurringRule);
  const updateRecurringRule = useFinanceStore((s) => s.updateRecurringRule);

  const isEditing = Boolean(rule);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    defaultValues: {
      title: rule?.title ?? "",
      amount: rule?.amount,
      type: rule?.type ?? "expense",
      categoryId: rule?.categoryId ?? "",
      frequency: rule?.frequency ?? "monthly",
      startDate: rule?.startDate ?? today(),
      endDate: rule?.endDate ?? "",
      note: rule?.note ?? "",
    },
  });

  const type = useWatch({ control, name: "type" });
  const filteredCategories = categories.filter((c) => c.type === type);

  const onSubmit = (values: RecurringFormValues) => {
    const data = {
      ...values,
      note: values.note || undefined,
      endDate: values.endDate || undefined,
    };

    if (rule) {
      updateRecurringRule(rule.id, {
        title: data.title,
        amount: data.amount,
        categoryId: data.categoryId,
        note: data.note,
        endDate: data.endDate,
      });
    } else {
      addRecurringRule(data);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {isEditing ? (
        <p className="text-sm text-gray-500">
          <span className="font-medium capitalize text-gray-900">
            {rule?.type}
          </span>
          {" · "}
          {rule && frequencyLabels[rule.frequency]}
          {" · started "}
          {rule?.startDate}
        </p>
      ) : (
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
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Title</label>
        <input
          {...register("title")}
          className={inputClass}
          placeholder="e.g. Netflix"
        />
        {errors.title && (
          <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
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

        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select {...register("categoryId")} className={inputClass}>
            <option value="">Select</option>
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
      </div>

      {!isEditing && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Repeats</label>
            <select {...register("frequency")} className={inputClass}>
              {frequencyOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Start date</label>
            <input
              type="date"
              {...register("startDate")}
              className={inputClass}
            />
            {errors.startDate && (
              <p className="mt-1 text-xs text-red-600">
                {errors.startDate.message}
              </p>
            )}
          </div>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">
          End date <span className="text-gray-400">(optional)</span>
        </label>
        <input type="date" {...register("endDate")} className={inputClass} />
        {errors.endDate && (
          <p className="mt-1 text-xs text-red-600">{errors.endDate.message}</p>
        )}
      </div>

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
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {isEditing ? "Save Changes" : "Add Recurring"}
      </button>
    </form>
  );
}
