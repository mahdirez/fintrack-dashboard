import type { Category, TransactionFilters } from "../types";
import { defaultFilters, hasActiveFilters } from "../utils/filterTransactions";

interface Props {
  filters: TransactionFilters;
  categories: Category[];
  onChange: (filters: TransactionFilters) => void;
}

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

export default function TransactionFiltersBar({
  filters,
  categories,
  onChange,
}: Props) {
  const update = <K extends keyof TransactionFilters>(
    key: K,
    value: TransactionFilters[K],
  ) => onChange({ ...filters, [key]: value });

  const handleTypeChange = (type: TransactionFilters["type"]) =>
    onChange({ ...filters, type, categoryId: "all" });

  const visibleCategories =
    filters.type === "all"
      ? categories
      : categories.filter(c => c.type === filters.type);

  return (
    <div className="mt-6 rounded-xl bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Search
          </label>
          <input
            type="search"
            value={filters.search}
            onChange={e => update("search", e.target.value)}
            placeholder="Search by title..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Type
          </label>
          <select
            value={filters.type}
            onChange={e =>
              handleTypeChange(e.target.value as TransactionFilters["type"])
            }
            className={inputClass}
          >
            <option value="all">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Category
          </label>
          <select
            value={filters.categoryId}
            onChange={e => update("categoryId", e.target.value)}
            className={inputClass}
          >
            <option value="all">All</option>
            {visibleCategories.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:col-span-2 lg:col-span-1">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              max={filters.dateTo || undefined}
              onChange={e => update("dateFrom", e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">
              To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              min={filters.dateFrom || undefined}
              onChange={e => update("dateTo", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {hasActiveFilters(filters) && (
        <button
          onClick={() => onChange(defaultFilters)}
          className="mt-3 text-sm font-medium text-indigo-600 hover:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
