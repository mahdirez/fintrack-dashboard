import type { BudgetProgress } from "../utils/budget";
import { formatCurrency } from "../utils/format";

interface Props {
  progress: BudgetProgress;
  onEdit: () => void;
  onRemove: () => void;
}

const barColor = {
  ok: "bg-green-500",
  warning: "bg-yellow-500",
  exceeded: "bg-red-500",
};

const badge = {
  ok: null,
  warning: {
    text: "Almost at limit",
    className: "bg-yellow-100 text-yellow-800",
  },
  exceeded: { text: "Over budget", className: "bg-red-100 text-red-700" },
};

export default function BudgetCard({ progress, onEdit, onRemove }: Props) {
  const { category, limit, spent, remaining, percent, status } = progress;
  const b = badge[status];

  return (
    <li className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="h-4 w-4 shrink-0 rounded-full"
            style={{ backgroundColor: category.color }}
            aria-hidden="true"
          />
          <h3 className="truncate font-semibold">{category.name}</h3>
          {b && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.className}`}
            >
              {b.text}
            </span>
          )}
        </div>

        <div className="flex shrink-0 gap-1">
          <button
            onClick={onEdit}
            aria-label={`Edit budget for ${category.name}`}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
          >
            Edit
          </button>
          <button
            onClick={onRemove}
            aria-label={`Remove budget for ${category.name}`}
            className="rounded-lg px-2 py-1 text-sm text-gray-500 hover:bg-red-50 hover:text-red-600"
          >
            Remove
          </button>
        </div>
      </div>

      <div
        className="mt-4 h-2.5 overflow-hidden rounded-full bg-gray-100"
        role="progressbar"
        aria-valuenow={Math.round(percent)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${category.name} budget used`}
      >
        <div
          className={`h-full rounded-full transition-all ${barColor[status]}`}
          style={{ width: `${Math.min(percent, 100)}%` }}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-gray-600">
          <span className="font-medium text-gray-900">
            {formatCurrency(spent)}
          </span>{" "}
          of {formatCurrency(limit)} ({Math.round(percent)}%)
        </p>
        <p
          className={
            remaining < 0 ? "font-medium text-red-600" : "text-gray-500"
          }
        >
          {remaining < 0
            ? `${formatCurrency(Math.abs(remaining))} over`
            : `${formatCurrency(remaining)} left`}
        </p>
      </div>
    </li>
  );
}
