"use client";

import {
  DatePickerController,
  SelectController,
  TextInputController,
} from "@/components/controllers";
import { useNumberInput } from "@/hooks/use-number-input";
import { type UseFormReturn } from "react-hook-form";
import { expenseSchema } from "@/schemas/expense-schema";

export { expenseSchema };

export type ExpenseFormState = {
  amount: number | undefined;
  category: string;
  description: string;
  expense_date: string;
  program_id: string;
};

const expenseCategoryOptions = [
  { label: "Ads", value: "ads" },
  { label: "Mentor Fee", value: "mentor_fee" },
  { label: "Tools", value: "tools" },
  { label: "Operational", value: "operational" },
  { label: "Referral Cashback", value: "referral_cashback" },
  { label: "Other", value: "other" },
];

interface ExpenseFormFieldsProps {
  form: UseFormReturn<ExpenseFormState>;
}

export function ExpenseFormFields({ form }: ExpenseFormFieldsProps) {
  const { formatNumberValue, createNumberInputHandler } = useNumberInput();
  const amount = form.watch("amount");

  return (
    <div className="space-y-4">
      <TextInputController
        form={form}
        name="amount"
        label="Amount"
        required
        placeholder="Enter amount"
        componentProps={{
          input: {
            type: "text",
            required: true,
            value: formatNumberValue(amount),
            onChange: createNumberInputHandler(form, "amount", true),
          },
        }}
      />

      <SelectController
        form={form}
        name="category"
        label="Category"
        placeholder="Select category"
        options={expenseCategoryOptions}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "category" },
        }}
      />

      <DatePickerController
        form={form}
        name="expense_date"
        label="Expense Date"
        required
        placeholder="Pick expense date"
      />

      <TextInputController
        form={form}
        name="description"
        label="Description"
        placeholder="Add expense details (optional)"
      />
    </div>
  );
}
