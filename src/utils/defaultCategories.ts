import type { Category } from "../types";

export const defaultCategories: Category[] = [
  { id: "salary", name: "Salary", type: "income", color: "#16a34a" },
  { id: "freelance", name: "Freelance", type: "income", color: "#22c55e" },
  { id: "investment", name: "Investment", type: "income", color: "#84cc16" },

  { id: "food", name: "Food", type: "expense", color: "#f97316" },
  { id: "transport", name: "Transport", type: "expense", color: "#3b82f6" },
  { id: "housing", name: "Housing", type: "expense", color: "#8b5cf6" },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "expense",
    color: "#ec4899",
  },
  { id: "health", name: "Health", type: "expense", color: "#ef4444" },
  { id: "shopping", name: "Shopping", type: "expense", color: "#eab308" },
  { id: "other", name: "Other", type: "expense", color: "#6b7280" },
];
