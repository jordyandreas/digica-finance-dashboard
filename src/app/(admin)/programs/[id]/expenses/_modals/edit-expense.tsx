"use client";

import { Modal } from "@/components/molecules/modals";
import type { Expense } from "@/services/expenses.service";
import { ExpenseFormFields } from "../_components/expense-form";
import { useEditExpense } from "../_hooks/use-edit-expense";

export interface EditExpenseModalProps {
  expense?: Expense | null;
  programId?: string;
  onSuccess?: () => void;
}

export function EditExpenseModal({
  expense,
  programId,
  onSuccess,
}: EditExpenseModalProps) {
  const { isOpen, close, form, handleSubmit, applyDisabled } = useEditExpense({
    expense,
    programId,
    onSuccess,
  });

  return (
    <Modal
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
        }
      }}
      title="Edit Expense"
      description="Update the expense information below."
      onApply={handleSubmit}
      applyLabel="Update"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ExpenseFormFields form={form} />
    </Modal>
  );
}
