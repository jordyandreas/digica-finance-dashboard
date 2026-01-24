"use client";

import { DataTable } from "@/components/molecules/data-table";
import { Expense } from "@/services/expenses.service";
import { expensesColumns } from "./columns";

interface ExpensesTableProps {
  data: Expense[];
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export function ExpensesTable({ data, onEdit, onDelete }: ExpensesTableProps) {
  return (
    <DataTable
      data={data}
      columns={expensesColumns({ onEdit, onDelete })}
      keyExtractor={(expense) => expense.id}
    />
  );
}
