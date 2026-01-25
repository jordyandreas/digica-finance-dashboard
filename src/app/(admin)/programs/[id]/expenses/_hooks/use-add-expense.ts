"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateExpenseInput,
  Expense,
} from "@/services/expenses.service";
import { deleteExpense } from "@/services/expenses.service";
import { useModal } from "@/hooks/use-modal";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import { useForm } from "react-hook-form";
import { expenseSchema } from "../_components/expense-form";
import type { AddExpenseModalProps } from "../_modals/add-expense";
import type { EditExpenseModalProps } from "../_modals/edit-expense";
import type { ExpenseFormState } from "../_components/expense-form";
import { expensesQueryKey, expensesSummaryQueryKey } from "./useExpenses";
import { dashboardProgramSummaryQueryKey } from "@/app/(admin)/dashboard/_hooks/use-dashboard-summary";

const defaultFormState = (programId: string): ExpenseFormState => ({
  amount: undefined,
  category: "",
  description: "",
  expense_date: "",
  program_id: programId,
});

type UseAddExpenseOptions = {
  programId?: string;
  onSuccess?: () => void;
};

export function useAddExpense({
  programId,
  onSuccess,
}: UseAddExpenseOptions = {}) {
  const queryClient = useQueryClient();
  const addExpenseModal = useModal<AddExpenseModalProps>("addExpenseModal");
  const editExpenseModal = useModal<EditExpenseModalProps>("editExpenseModal");
  const [loading, setLoading] = React.useState(false);
  const resolvedProgramId = programId ?? addExpenseModal.props?.programId ?? "";
  const resolvedOnSuccess = onSuccess ?? addExpenseModal.props?.onSuccess;
  const form = useForm<ExpenseFormState>({
    defaultValues: defaultFormState(resolvedProgramId),
  });
  const amount = form.watch("amount");
  const category = form.watch("category");
  const expenseDate = form.watch("expense_date");

  React.useEffect(() => {
    if (addExpenseModal.isOpen) {
      form.reset(defaultFormState(resolvedProgramId));
      form.clearErrors();
    }
  }, [form, addExpenseModal.isOpen, resolvedProgramId]);

  const invalidateExpenses = async () => {
    if (!resolvedProgramId) {
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: expensesQueryKey(resolvedProgramId),
    });
    await queryClient.invalidateQueries({
      queryKey: expensesSummaryQueryKey(resolvedProgramId),
    });
    await queryClient.invalidateQueries({
      queryKey: dashboardProgramSummaryQueryKey(resolvedProgramId),
    });
  };

  const handleSuccess = async () => {
    if (resolvedOnSuccess) {
      resolvedOnSuccess();
      return;
    }
    await invalidateExpenses();
  };

  const handleAddClick = () => {
    addExpenseModal.open({
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
    });
  };

  const handleEdit = (expense: Expense) => {
    editExpenseModal.open({
      expense,
      programId: resolvedProgramId,
      onSuccess: handleSuccess,
    });
  };

  const deleteConfirmation = useDeleteConfirmation<Expense>({
    title: "Do you want to delete this expense?",
    description: "You can't take it back when you delete it",
  });
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = (expense: Expense) => {
    deleteConfirmation.openConfirmation(
      expense,
      "Do you want to delete this expense?",
      "You can't take it back when you delete it"
    );
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmation.item) return;

    setIsDeleting(true);
    try {
      await deleteExpense(deleteConfirmation.item.id);
      await invalidateExpenses();
      toast.success("Expense deleted successfully");
    } catch (error) {
      console.error("Error deleting expense:", error);
      toast.error("Failed to delete expense. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

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

    if (!resolvedProgramId) {
      toast.error("Program ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const { createExpense } = await import("@/services/expenses.service");

      const expenseData: CreateExpenseInput = {
        amount: values.amount as number,
        category: values.category as CreateExpenseInput["category"],
        description: values.description?.trim() || undefined,
        expense_date: values.expense_date,
        program_id: values.program_id || resolvedProgramId,
      };

      const result = await createExpense(expenseData);

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

      toast.success("Expense created successfully");
      await handleSuccess();
      addExpenseModal.close();
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
    isOpen: addExpenseModal.isOpen,
    close: addExpenseModal.close,
    form,
    handleSubmit,
    applyDisabled,
    handleAddClick,
    handleEdit,
    handleDelete,
    deleteConfirmation: {
      isOpen: deleteConfirmation.isOpen,
      setOpen: deleteConfirmation.setOpen,
      title: deleteConfirmation.title,
      description: deleteConfirmation.description,
      onConfirm: handleConfirmDelete,
      isDeleting,
    },
  };
}
