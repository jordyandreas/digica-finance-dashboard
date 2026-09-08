import type { ExpenseCategory } from "@/services/expenses.service";

export const EXPENSE_CATEGORY_ORDER: ExpenseCategory[] = [
  "ads",
  "mentor_fee",
  "tools",
  "operational",
  "referral_cashback",
  "other",
];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  ads: "Ads",
  mentor_fee: "Mentor Fee",
  tools: "Tools",
  operational: "Operational",
  referral_cashback: "Referral Cashback",
  other: "Other",
};

export function formatExpenseCategoryLabel(
  category: string | null | undefined,
): string {
  if (!category) return "Other";
  if (category in EXPENSE_CATEGORY_LABELS) {
    return EXPENSE_CATEGORY_LABELS[category as ExpenseCategory];
  }
  return category.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function isExpenseCategory(value: string): value is ExpenseCategory {
  return EXPENSE_CATEGORY_ORDER.includes(value as ExpenseCategory);
}
