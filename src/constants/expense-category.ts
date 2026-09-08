import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_ORDER,
} from "@/utils/expense-category";

export const EXPENSE_CATEGORY_ALL = "all";

export const EXPENSE_CATEGORY_FILTER_OPTIONS = [
  { label: "All categories", value: EXPENSE_CATEGORY_ALL },
  ...EXPENSE_CATEGORY_ORDER.map((category) => ({
    label: EXPENSE_CATEGORY_LABELS[category],
    value: category,
  })),
];
