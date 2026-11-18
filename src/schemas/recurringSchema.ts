import { z } from "zod";

export const recurringSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(50, "Title must be at most 50 characters"),
    amount: z
      .number({ error: "Amount is required" })
      .positive("Amount must be greater than 0")
      .max(1_000_000_000, "Amount is too large"),
    type: z.enum(["income", "expense"]),
    categoryId: z.string().min(1, "Please select a category"),
    frequency: z.enum(["weekly", "monthly", "yearly"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    note: z.string().max(200, "Note must be at most 200 characters").optional(),
  })
  .refine((v) => !v.endDate || v.endDate >= v.startDate, {
    message: "End date must be on or after the start date",
    path: ["endDate"],
  });

export type RecurringFormValues = z.infer<typeof recurringSchema>;
