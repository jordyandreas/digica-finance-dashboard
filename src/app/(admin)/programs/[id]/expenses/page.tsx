"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { formatCurrency } from "@/utils/currency";
import { useExpensesPaginated, useExpensesSummary } from "./_hooks/useExpenses";
import { useAddExpense } from "./_hooks/use-add-expense";
import { ExpensesTable } from "./_table";

export default function ExpensesPage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const {
    data: expensesResult,
    error,
    isLoading: isExpensesLoading,
  } = useExpensesPaginated(programId, page, limit);
  const {
    data: summary,
    error: summaryError,
    isLoading: isSummaryLoading,
  } = useExpensesSummary(programId);
  const { handleAddClick, handleEdit, handleDelete, deleteConfirmation } =
    useAddExpense({ programId });

  const totalAmount = summary?.total || 0;
  const isLoading = isExpensesLoading || isSummaryLoading;
  const combinedError = error ?? summaryError;
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">Track all outgoing expenses</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      {combinedError && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error loading expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {combinedError instanceof Error
                ? combinedError.message
                : "Unknown error"}
            </p>
            <p className="mt-2 text-xs">
              Please ensure your Supabase &quot;expenses&quot; table exists and
              has the correct schema.
            </p>
          </CardContent>
        </Card>
      )}

      {!combinedError && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isSummaryLoading ? (
                <>
                  <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                  <div className="mt-2 h-4 w-28 animate-pulse rounded bg-muted" />
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-red-700">
                    {formatCurrency(totalAmount)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {summary?.count || 0} expense
                    {summary?.count !== 1 ? "s" : ""} recorded
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            {isExpensesLoading ? (
              <DataTableSkeleton rows={limit} columns={5} />
            ) : (
              <>
                <ExpensesTable
                  data={expensesResult?.data ?? []}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                <DataTablePaginationControl
                  currentPage={expensesResult?.pagination.page ?? page}
                  totalPages={expensesResult?.pagination.total_page ?? 1}
                  onPageChange={setPage}
                  pageSize={limit}
                  onPageSizeChange={(nextLimit) => {
                    setLimit(nextLimit);
                    setPage(1);
                  }}
                />
              </>
            )}
          </Card>
        </>
      )}

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={deleteConfirmation.onConfirm}
        isLoading={deleteConfirmation.isDeleting}
      />
    </div>
  );
}
