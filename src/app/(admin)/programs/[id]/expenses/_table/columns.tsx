import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { emptyFallback } from "@/utils/string";
import { Expense } from "@/services/expenses.service";
import { Pencil, Trash2 } from "lucide-react";

const categoryLabelMap: Record<string, string> = {
  ads: "Ads",
  mentor_fee: "Mentor Fee",
  tools: "Tools",
  operational: "Operational",
  referral_cashback: "Referral Cashback",
  other: "Other",
};

interface ExpensesColumnsProps {
  onEdit?: (expense: Expense) => void;
  onDelete?: (expense: Expense) => void;
}

export function expensesColumns({
  onEdit,
  onDelete,
}: ExpensesColumnsProps): ColumnDef<Expense>[] {
  return [
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      cell: (expense) => {
        const categoryLabel =
          categoryLabelMap[expense.category] ?? expense.category;
        return (
          <Typography variant="body3">
            {emptyFallback(categoryLabel)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "amount",
      header: "Amount",
      enableSorting: true,
      cell: (expense) => (
        <Typography variant="body3" className="font-medium text-red-700">
          {formatCurrency(expense.amount)}
        </Typography>
      ),
    },
    {
      accessorKey: "expense_date",
      header: "Expense Date",
      enableSorting: true,
      cell: (expense) => (
        <Typography variant="body3" className="font-medium">
          {emptyFallback(formatDate(expense.expense_date))}
        </Typography>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      enableSorting: true,
      className: "max-w-md",
      cell: (expense) => (
        <Typography variant="body3">
          {emptyFallback(expense.description)}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (expense) => (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(expense)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit expense</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(expense)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete expense</span>
            </Button>
          )}
        </div>
      ),
    },
  ];
}
