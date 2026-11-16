import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(24, "Name must be at most 24 characters"),
  type: z.enum(["income", "expense"]),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color"),
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
