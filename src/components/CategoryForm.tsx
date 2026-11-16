import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  categorySchema,
  type CategoryFormValues,
} from "../schemas/categorySchema";
import { useFinanceStore } from "../store/useFinanceStore";
import { colorPalette, isDuplicateCategoryName } from "../utils/categories";
import type { Category } from "../types";

interface Props {
  category?: Category;
  onSuccess: () => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function CategoryForm({ category, onSuccess }: Props) {
  const categories = useFinanceStore((s) => s.categories);
  const addCategory = useFinanceStore((s) => s.addCategory);
  const updateCategory = useFinanceStore((s) => s.updateCategory);

  const isEditing = Boolean(category);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      type: category?.type ?? "expense",
      color: category?.color ?? colorPalette[0],
    },
  });

  const type = useWatch({ control, name: "type" });
  const color = useWatch({ control, name: "color" });

  const onSubmit = (values: CategoryFormValues) => {
    if (
      isDuplicateCategoryName(
        categories,
        values.name,
        values.type,
        category?.id,
      )
    ) {
      setError("name", { message: "A category with this name already exists" });
      return;
    }

    if (category) {
      updateCategory(category.id, { name: values.name, color: values.color });
    } else {
      addCategory(values);
    }
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {isEditing ? (
        <p className="text-sm text-gray-500">
          Type:{" "}
          <span className="font-medium capitalize text-gray-900">
            {category?.type}
          </span>
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {(["expense", "income"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setValue("type", t)}
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
        <label className="mb-1 block text-sm font-medium">Name</label>
        <input
          {...register("name")}
          className={inputClass}
          placeholder="e.g. Gym"
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Color</label>
        <div className="flex flex-wrap items-center gap-2">
          {colorPalette.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setValue("color", c, { shouldValidate: true })}
              aria-label={`Select color ${c}`}
              aria-pressed={color === c}
              className={`h-8 w-8 rounded-full ${
                color === c ? "ring-2 ring-indigo-500 ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) =>
              setValue("color", e.target.value, { shouldValidate: true })
            }
            aria-label="Custom color"
            className="h-8 w-10 cursor-pointer rounded border border-gray-300 bg-transparent"
          />
        </div>
        {errors.color && (
          <p className="mt-1 text-xs text-red-600">{errors.color.message}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {isEditing ? "Save Changes" : "Add Category"}
      </button>
    </form>
  );
}
