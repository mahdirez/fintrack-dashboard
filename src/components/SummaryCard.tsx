interface SummaryCardProps {
  label: string;
  value: string;
  variant: "income" | "expense" | "balance";
}

const styles = {
  income: { text: "text-green-600", dot: "bg-green-500" },
  expense: { text: "text-red-600", dot: "bg-red-500" },
  balance: { text: "text-indigo-600", dot: "bg-indigo-500" },
};

export default function SummaryCard({
  label,
  value,
  variant,
}: SummaryCardProps) {
  const s = styles[variant];

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <span
          className={`h-2.5 w-2.5 rounded-full ${s.dot}`}
          aria-hidden="true"
        />
        <p className="text-sm font-medium text-gray-500">{label}</p>
      </div>
      <p className={`mt-3 text-2xl font-bold ${s.text}`}>{value}</p>
    </div>
  );
}
