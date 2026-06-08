import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { Payment } from "@/services/payments.service";
import { StatusBadge } from "@/components/atoms/status-badge";
import { emptyFallback } from "@/utils/string";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms";
import { Pencil, Trash2 } from "lucide-react";
import { SeeMoreText } from "@/components/molecules/see-more-text";

interface PaymentsColumnsProps {
  onEdit?: (payment: Payment) => void;
  onDelete?: (payment: Payment) => void;
  participantNamesById?: Record<string, string>;
}

function formatPaidTenor(payment: Payment): string {
  if (payment.payment_type !== "tenor" || payment.tenor == null) {
    return "";
  }

  if (payment.paid_tenor == null) {
    return "";
  }

  return `${payment.paid_tenor}/${payment.tenor}`;
}

function formatPaymentType(payment: Payment): string {
  const type = payment.payment_type?.trim();
  if (!type) {
    return "";
  }

  if (type === "tenor" && payment.tenor != null) {
    return `Tenor - ${payment.tenor}x`;
  }

  return type.charAt(0).toUpperCase() + type.slice(1);
}

export function paymentsColumns({
  onEdit,
  onDelete,
  participantNamesById = {},
}: PaymentsColumnsProps): ColumnDef<Payment>[] {
  return [
    {
      accessorKey: "participant_name",
      header: "Participant Name",
      enableSorting: true,
      minSize: 140,
      maxSize: 240,
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
      minSize: 110,
      maxSize: 160,
      className: "text-left",
      cell: (payment) => {
        const amount =
          payment.amount === null || payment.amount === undefined
            ? null
            : formatCurrency(payment.amount);
        return (
          <Typography variant="body3" className="whitespace-nowrap font-medium text-brand-royal">
            {emptyFallback(amount)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "payment_type",
      header: "Payment Type",
      enableSorting: true,
      minSize: 90,
      maxSize: 140,
      cell: (payment) => (
        <Typography variant="body3" className="whitespace-nowrap font-medium">
          {emptyFallback(formatPaymentType(payment))}
        </Typography>
      ),
    },
    {
      accessorKey: "paid_tenor",
      header: "Paid Tenor",
      enableSorting: true,
      minSize: 90,
      maxSize: 120,
      cell: (payment) => (
        <Typography variant="body3" className="whitespace-nowrap font-medium">
          {emptyFallback(formatPaidTenor(payment))}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      minSize: 150,
      cell: (payment) => (
        <StatusBadge status={payment.status || "pending"} />
      ),
    },
    {
      id: "referral",
      header: "Referral",
      enableSorting: true,
      minSize: 90,
      maxSize: 180,
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
      accessorKey: "notes",
      header: "Notes",
      enableSorting: true,
      minSize: 60,
      maxSize: 180,
      cell: (payment) => <SeeMoreText text={payment.notes} />,
    },
    {
      accessorKey: "paid_at",
      header: "Paid At",
      enableSorting: true,
      minSize: 100,
      maxSize: 130,
      cell: (payment) => (
        <Typography variant="body3" className="whitespace-nowrap">
          {emptyFallback(payment.paid_at ? formatDate(payment.paid_at) : null)}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: (payment) => (
        <div className="flex items-center gap-1">
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
