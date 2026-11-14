import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SummaryCard from "../components/SummaryCard";
import { useFinanceStore } from "../store/useFinanceStore";
import { filterByRange, rangeOptions, type RangeKey } from "../utils/dateRange";
import { formatCurrency, formatDate } from "../utils/format";
import { calculateSummary } from "../utils/summary";
import ExpensePieChart from "../components/ExpensePieChart";
import MonthlyBarChart from "../components/MonthlyBarChart";
import { getExpenseByCategory, getMonthlyTotals } from "../utils/chartData";

export default function DashboardPage() {
  const transactions = useFinanceStore((s) => s.transactions);
  const categories = useFinanceStore((s) => s.categories);
  const [range, setRange] = useState<RangeKey>("month");

  const inRange = useMemo(
    () => filterByRange(transactions, range),
    [transactions, range],
  );

  const summary = useMemo(() => calculateSummary(inRange), [inRange]);

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const recent = useMemo(
    () => [...inRange].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [inRange],
  );

  const expenseByCategory = useMemo(
    () => getExpenseByCategory(inRange, categories),
    [inRange, categories],
  );

  const monthly = useMemo(
    () => getMonthlyTotals(transactions, 6),
    [transactions],
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-semibold">Dashboard</h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value as RangeKey)}
          aria-label="Date range"
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        >
          {rangeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Income"
          value={formatCurrency(summary.income)}
          variant="income"
        />
        <SummaryCard
          label="Expenses"
          value={formatCurrency(summary.expense)}
          variant="expense"
        />
        <SummaryCard
          label="Balance"
          value={formatCurrency(summary.balance)}
          variant="balance"
        />
      </div>
      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Spending by category</h3>
          <ExpensePieChart data={expenseByCategory} />
        </section>

        <section className="rounded-xl bg-white p-5 shadow-sm">
          <h3 className="mb-2 text-lg font-semibold">Last 6 months</h3>
          <MonthlyBarChart data={monthly} />
        </section>
      </div>
      <section className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recent transactions</h3>
          <Link
            to="/transactions"
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {recent.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No transactions in this period.
          </div>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100 rounded-xl bg-white shadow-sm">
            {recent.map((t) => {
              const category = categoryMap.get(t.categoryId);
              const isIncome = t.type === "income";
              return (
                <li key={t.id} className="flex items-center gap-3 p-4">
                  <span
                    className="h-8 w-8 shrink-0 rounded-full"
                    style={{ backgroundColor: category?.color ?? "#9ca3af" }}
                    aria-hidden="true"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-gray-500">
                      {category?.name ?? "Unknown"} · {formatDate(t.date)}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-semibold ${
                      isIncome ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {formatCurrency(t.amount)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
