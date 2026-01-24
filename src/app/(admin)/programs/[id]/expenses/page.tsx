"use client";

import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { useExpenses, useExpensesSummary } from "./_hooks/useExpenses";
import { useAddExpense } from "./_hooks/use-add-expense";
import { ExpensesTable } from "./_table";

export default function ExpensesPage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";
  const {
    data: expenses,
    error,
    isLoading: isExpensesLoading,
  } = useExpenses(programId);
  const {
    data: summary,
    error: summaryError,
    isLoading: isSummaryLoading,
  } = useExpensesSummary(programId);
  const { handleAddClick, handleEdit, handleDelete } =
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

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading expenses...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching expenses from Supabase.
            </p>
          </CardContent>
        </Card>
      )}

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

      {!combinedError && !isLoading && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.count || 0} expense
                {summary?.count !== 1 ? "s" : ""} recorded
              </p>
            </CardContent>
          </Card>

          <Card>
            <ExpensesTable
              data={expenses || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </Card>
        </>
      )}
    </div>
  );
}
