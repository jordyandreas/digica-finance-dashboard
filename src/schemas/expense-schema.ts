"use client";

import { z } from "zod";

export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  category: z.enum(
    ["ads", "mentor_fee", "tools", "operational", "referral_cashback", "other"],
    {
      message: "Category is required",
    },
  ),
  description: z.string().trim().optional(),
  expense_date: z.string().trim().min(1, "Expense date is required"),
});
