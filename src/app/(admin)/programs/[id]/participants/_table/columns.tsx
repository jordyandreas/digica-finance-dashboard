import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatDate } from "@/utils/date";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Participant } from "@/services/participants.service";
import { Button } from "@/components/atoms/button";
import { Pencil, Trash2 } from "lucide-react";
import { emptyFallback, formatShortId } from "@/utils/string";
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
      accessorKey: "name",
      header: "Participant",
      enableSorting: true,
      cell: (participant) => (
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography variant="body3" className="font-medium capitalize">
            {emptyFallback(participant.name)}
          </Typography>
          {participant.email ? (
            <Typography
              variant="label"
              className="normal-case lowercase text-muted-foreground"
            >
              {participant.email}
            </Typography>
          ) : null}
          {participant.phone ? (
            <Typography
              variant="label"
              className="normal-case text-muted-foreground"
            >
              {participant.phone}
            </Typography>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "occupation",
      header: "Work",
      enableSorting: true,
      cell: (participant) => {
        const occupationLabel = occupationOptions.find(
          (option) => option.value === participant.occupation,
        )?.label;
        return (
          <div className="flex min-w-0 flex-col gap-0.5">
            <Typography variant="body3" className="capitalize">
              {emptyFallback(occupationLabel)}
            </Typography>
            {participant.organization ? (
              <Typography
                variant="label"
                className="normal-case uppercase text-muted-foreground"
              >
                {participant.organization}
              </Typography>
            ) : null}
          </div>
        );
      },
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
