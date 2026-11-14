import { Link } from "react-router-dom";
import type { BudgetProgress } from "../utils/budget";

interface Props {
  progress: BudgetProgress[];
}

export default function BudgetAlerts({ progress }: Props) {
  const alerts = progress.filter((p) => p.status !== "ok");
  if (alerts.length === 0) return null;

  return (
    <div
      role="alert"
      className="mt-6 rounded-xl border border-yellow-200 bg-yellow-50 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-yellow-900">Budget alerts</p>
        <Link
          to="/budgets"
          className="text-sm font-medium text-yellow-900 underline"
        >
          View budgets
        </Link>
      </div>
      <ul className="mt-2 space-y-1 text-sm text-yellow-800">
        {alerts.map((a) => (
          <li key={a.category.id}>
            {a.status === "exceeded"
              ? `${a.category.name}: over budget (${Math.round(a.percent)}%)`
              : `${a.category.name}: ${Math.round(a.percent)}% of the budget used`}
          </li>
        ))}
      </ul>
    </div>
  );
}
