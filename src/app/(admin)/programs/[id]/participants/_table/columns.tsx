import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatDate } from "@/utils/date";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Participant } from "@/services/participants.service";
import { Button } from "@/components/atoms/button";
import { Pencil, Trash2 } from "lucide-react";
import { emptyFallback } from "@/utils/string";
import { occupationOptions } from "@/schemas/participant-schema";
import { Typography } from "@/components/atoms";

interface ParticipantsColumnsProps {
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
}

export function participantsColumns({
  onEdit,
  onDelete,
}: ParticipantsColumnsProps): ColumnDef<Participant>[] {
  return [
    {
      accessorKey: "id",
      header: "ID",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3">{emptyFallback(participant.id)}</Typography>
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3" className="font-medium capitalize">
          {emptyFallback(participant.name)}
        </Typography>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3" className="lowercase">
          {emptyFallback(participant.email)}
        </Typography>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3">{emptyFallback(participant.phone)}</Typography>
      ),
    },
    {
      accessorKey: "occupation",
      header: "Occupation",
      enableSorting: true,
      cell: (participant) => {
        const occupationLabel = occupationOptions.find(
          (option) => option.value === participant.occupation,
        )?.label;
        return (
          <Typography variant="body3" className="capitalize">
            {emptyFallback(occupationLabel)}
          </Typography>
        );
      },
    },
    {
      accessorKey: "organization",
      header: "Organization",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3" className="uppercase">
          {emptyFallback(participant.organization)}
        </Typography>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (participant) =>
        participant.status ? (
          <StatusBadge status={participant.status} />
        ) : (
          <Typography variant="body3">{emptyFallback("")}</Typography>
        ),
    },
    {
      accessorKey: "payment_status",
      header: "Payment Status",
      enableSorting: true,
      cell: (participant) =>
        participant.payment_status ? (
          <StatusBadge status={participant.payment_status} />
        ) : (
          <Typography variant="body3">{emptyFallback("")}</Typography>
        ),
    },
    {
      accessorKey: "joined_date",
      header: "Joined Date",
      enableSorting: true,
      cell: (participant) => (
        <Typography variant="body3">
          {emptyFallback(
            participant.joined_date ? formatDate(participant.joined_date) : "",
          )}
        </Typography>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      className: "sticky right-0 bg-background",
      cell: (participant) => (
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(participant)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit participant</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(participant)}
              className="h-8 w-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete participant</span>
            </Button>
          )}
        </div>
      ),
    },
  ];
}