"use client";

import { Modal } from "@/components/molecules/modals";
import { ExpenseFormFields } from "../_components/expense-form";
import { useAddExpense } from "../_hooks/use-add-expense";

export interface AddExpenseModalProps {
  programId?: string;
  onSuccess?: () => void;
}

export function AddExpenseModal({ programId, onSuccess }: AddExpenseModalProps) {
  const { isOpen, close, form, handleSubmit, applyDisabled } = useAddExpense({
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
      title="Add Expense"
      description="Fill in the details to add a new expense."
      onApply={handleSubmit}
      applyLabel="Create"
      applyDisabled={applyDisabled}
      onCancel={close}
    >
      <ExpenseFormFields form={form} />
    </Modal>
  );
}
