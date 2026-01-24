import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Payment } from "@/services/payments.service";
import { StatusBadge } from "@/components/atoms/status-badge";
import { emptyFallback } from "@/utils/string";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms";
import { Pencil, Trash2 } from "lucide-react";

interface PaymentsColumnsProps {
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  participantNamesById?: Record<string, string>;
}

export function paymentsColumns({
  onEdit,
  onDelete,
  participantNamesById = {},
}: PaymentsColumnsProps): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      cell: (payment) => (
        <Typography variant="body3" className="font-medium">
          {emptyFallback(payment.id)}
        </Typography>
      ),
    },
    {
      accessorKey: "participant_name",
      header: "Participant Name",
      enableSorting: true,
      cell: (payment) => (
        <Typography variant="body3" className="font-medium">
          {emptyFallback(payment.participant_name)}
        </Typography>
      ),
    },
    {
      accessorKey: "amount",
      header: "Amount",
      enableSorting: true,
      className: "text-right",
      cell: (payment) => {
        const amount =
          payment.amount === null || payment.amount === undefined
            ? null
            : formatCurrency(payment.amount);
        return (
          <Typography variant="body3" className="font-medium text-green-700">
            {emptyFallback(amount)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "payment_type",
      header: "Payment Type",
      enableSorting: true,
      cell: (payment) => (
        <Typography variant="body3" className="font-medium">
          {emptyFallback(payment.payment_type)}
        </Typography>
      ),
    },
    {
      accessorKey: "tenor",
      header: "Tenor",
      enableSorting: true,
      cell: (payment) => {
        if (payment.payment_type !== "tenor") {
          return (
            <Typography variant="body3">{emptyFallback("")}</Typography>
          );
        }
        return (
          <Typography variant="body3" className="font-medium">
            {emptyFallback(payment.tenor)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (payment) => (
        <StatusBadge status={payment.status || "pending"} />
      ),
    },
    {
      id: "referral",
      header: "Referral",
      enableSorting: true,
      cell: (payment) => {
        const referralId = payment.referral_name;
        const referralName =
          referralId && referralId !== "none"
            ? participantNamesById[referralId] || referralId
            : "No referral";
        return <Typography variant="body3">{emptyFallback(referralName)}</Typography>;
      },
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      enableSorting: true,
      cell: (payment) => (
        <Typography variant="body3">
          {emptyFallback(payment.created_at ? formatDate(payment.created_at) : null)}
        </Typography>
      ),
    },
    {
      accessorKey: "paid_at",
      header: "Paid At",
      enableSorting: true,
      cell: (payment) => (
        <Typography variant="body3">
          {emptyFallback(payment.paid_at ? formatDate(payment.paid_at) : null)}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (payment) => (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(payment)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit payment</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(payment)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete payment</span>
            </Button>
          )}
        </div>
      ),
    },
  ];
}