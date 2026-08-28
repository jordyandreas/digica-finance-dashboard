"use client";

import { DataTable } from "@/components/molecules/data-table";
import { Payment } from "@/services/payments.service";
import { paymentsColumns } from "./columns";

interface PaymentsTableProps {
  data: Payment[];
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
}

export function PaymentsTable({
  data,
  onEdit,
  onDelete,
}: PaymentsTableProps) {
  const columns = paymentsColumns({ onEdit, onDelete });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(payment) => payment.id}
    />
  );
}