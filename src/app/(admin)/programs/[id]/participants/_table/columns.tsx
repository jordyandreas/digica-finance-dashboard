import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatDate } from "@/utils/date";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Participant } from "@/services/participants.service";
import { Button } from "@/components/atoms/button";
import { Copy, Pencil, Trash2 } from "lucide-react";
import { emptyFallback } from "@/utils/string";
import { occupationOptions } from "@/schemas/participant-schema";
import { Typography } from "@/components/atoms";
import { toast } from "sonner";

interface ParticipantsColumnsProps {
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
}

async function copyEmail(email: string) {
  try {
    await navigator.clipboard.writeText(email);
    toast.success("Email copied to clipboard");
  } catch {
    toast.error("Failed to copy email");
  }
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
      minSize: 160,
      maxSize: 280,
      cell: (participant) => (
        <div className="flex flex-col gap-0.5">
          <Typography
            variant="body3"
            className="font-semibold capitalize text-primary"
          >
            {emptyFallback(participant.name)}
          </Typography>
          {participant.email ? (
            <button
              type="button"
              onClick={() => copyEmail(participant.email!)}
              className="group inline-flex max-w-full items-center gap-1 text-left"
              title="Copy email"
            >
              <Typography
                variant="label"
                className="truncate normal-case lowercase text-muted-foreground group-hover:text-primary"
              >
                {participant.email}
              </Typography>
              <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
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
      minSize: 120,
      maxSize: 220,
      cell: (participant) => {
        const occupationLabel = occupationOptions.find(
          (option) => option.value === participant.occupation,
        )?.label;
        return (
          <div className="flex flex-col gap-0.5">
            <Typography variant="body3" className="capitalize text-primary">
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
      minSize: 80,
      maxSize: 120,
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
      minSize: 100,
      maxSize: 150,
      cell: (participant) =>
        participant.payment_status ? (
          <StatusBadge status={participant.payment_status} />
        ) : (
          <Typography variant="body3">{emptyFallback("")}</Typography>
        ),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      enableSorting: true,
      minSize: 60,
      maxSize: 180,
      cell: (participant) => (
        <Typography variant="body3" className="truncate">
          {emptyFallback(participant.notes)}
        </Typography>
      ),
    },
    {
      accessorKey: "joined_date",
      header: "Joined Date",
      enableSorting: true,
      minSize: 100,
      maxSize: 130,
      cell: (participant) => (
        <Typography variant="body3" className="whitespace-nowrap">
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
      cell: (participant) => (
        <div className="flex items-center gap-1">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(participant)}
              className="h-8 w-8 text-primary hover:text-primary"
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
