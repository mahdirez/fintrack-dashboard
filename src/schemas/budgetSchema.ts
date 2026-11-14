import { z } from "zod";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Please select a category"),
  limit: z
    .number({ error: "Limit is required" })
    .positive("Limit must be greater than 0")
    .max(1_000_000_000, "Limit is too large"),
});

export type BudgetFormValues = z.infer<typeof budgetSchema>;
