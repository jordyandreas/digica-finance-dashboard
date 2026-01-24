"use client";

import { ProgramModal } from "@/app/(admin)/programs/_modals/add-program";
import { AddParticipantModal } from "@/app/(admin)/programs/[id]/participants/_modals/add-participant";
import { EditParticipantModal } from "@/app/(admin)/programs/[id]/participants/_modals/edit-participant";
import { AddPaymentModal } from "@/app/(admin)/programs/[id]/payments/_modals/add-payment";
import { EditPaymentModal } from "@/app/(admin)/programs/[id]/payments/_modals/edit-payment";
import { AddExpenseModal } from "@/app/(admin)/programs/[id]/expenses/_modals/add-expense";
import { EditExpenseModal } from "@/app/(admin)/programs/[id]/expenses/_modals/edit-expense";

export const modals = {
  programModal: ProgramModal,
  addParticipantModal: AddParticipantModal,
  editParticipantModal: EditParticipantModal,
  addPaymentModal: AddPaymentModal,
  editPaymentModal: EditPaymentModal,
  addExpenseModal: AddExpenseModal,
  editExpenseModal: EditExpenseModal,
} as const;

export type ModalComponentNames = keyof typeof modals;
