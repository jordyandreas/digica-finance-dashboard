"use client";

import * as React from "react";
import { toast } from "sonner";
import type {
  Expense,
  UpdateExpenseInput,
} from "@/services/expenses.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import { expenseSchema } from "../_components/expense-form";
import type { EditExpenseModalProps } from "../_modals/edit-expense";
import type { ExpenseFormState } from "../_components/expense-form";
import { useQueryClient } from "@tanstack/react-query";
import { expensesQueryKey, expensesSummaryQueryKey } from "./useExpenses";
import { dashboardProgramSummaryQueryKey } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";

const buildFormState = (
  expense: Expense | null | undefined,
  programId: string,
): ExpenseFormState => ({
  amount: expense?.amount ?? undefined,
  category: expense?.category || "",
  description: expense?.description || "",
  expense_date: expense?.expense_date
    ? expense.expense_date.split("T")[0]
    : "",
  program_id: expense?.program_id || programId,
});

export function useEditExpense({
  expense,
  programId,
  onSuccess,
}: EditExpenseModalProps) {
  const { isOpen, close } = useModal<EditExpenseModalProps>("editExpenseModal");
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId = programId ?? "";
  const queryClient = useQueryClient();
  const form = useForm<ExpenseFormState>({
    defaultValues: buildFormState(expense, resolvedProgramId),
  });
  const amount = form.watch("amount");
  const category = form.watch("category");
  const expenseDate = form.watch("expense_date");

  React.useEffect(() => {
    if (isOpen) {
      form.reset(buildFormState(expense, resolvedProgramId));
      form.clearErrors();
    }
  }, [form, expense, isOpen, resolvedProgramId]);

  const handleSubmit = form.handleSubmit(async (values: ExpenseFormState) => {
    const validation = expenseSchema.safeParse({
      amount: values.amount ?? 0,
      category: values.category,
      description: values.description,
      expense_date: values.expense_date,
    });

    if (!validation.success) {
      for (const issue of validation.error.issues) {
        const field = issue.path[0] as keyof ExpenseFormState | undefined;
        if (field && !form.formState.errors[field]) {
          form.setError(field, { type: "manual", message: issue.message });
        }
      }
      toast.error("Please fix the highlighted fields.");
      return;
    }

    if (!expense) {
      toast.error("Expense data is missing.");
      return;
    }

    if (!resolvedProgramId) {
      toast.error("Program ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const { updateExpense } = await import("@/services/expenses.service");

      const expenseData: UpdateExpenseInput = {
        amount: values.amount as number,
        category: values.category as UpdateExpenseInput["category"],
        description: values.description?.trim() || undefined,
        expense_date: values.expense_date,
        program_id: values.program_id || resolvedProgramId,
      };

      const result = await updateExpense(expense.id, expenseData);

      if (result.error) {
        console.error("Error saving expense:", result.error);
        const errorMessage =
          result.error.message || JSON.stringify(result.error);
        toast.error("Error saving expense", {
          description: errorMessage,
        });
        setLoading(false);
        throw new Error(errorMessage);
      }

      toast.success("Expense updated successfully");
      if (onSuccess) {
        onSuccess();
      } else if (resolvedProgramId) {
        await queryClient.invalidateQueries({
          queryKey: expensesQueryKey(resolvedProgramId),
        });
        await queryClient.invalidateQueries({
          queryKey: expensesSummaryQueryKey(resolvedProgramId),
        });
        await queryClient.invalidateQueries({
          queryKey: dashboardProgramSummaryQueryKey(resolvedProgramId),
        });
      }
      close();
      setLoading(false);
    } catch (error) {
      console.error("Error saving expense:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error("Error saving expense", {
        description: errorMessage,
      });
      setLoading(false);
    }
  });

  const applyDisabled =
    loading ||
    amount === undefined ||
    !category?.trim() ||
    !expenseDate?.trim();

  return {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  };
}
