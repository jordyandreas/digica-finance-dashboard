import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { formatDateTime } from "@/utils/date";
import { StatusBadge } from "@/components/atoms/status-badge";
import { RegistrationSourceBadge } from "@/components/atoms/registration-source-badge";
import { Participant } from "@/services/participants.service";
import { Button } from "@/components/atoms/button";
import { Banknote, Copy, Mail, Pencil, Phone, Trash2, UserRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { emptyFallback, toTitleCase } from "@/utils/string";
import { occupationOptions } from "@/schemas/participant-schema";
import { Typography } from "@/components/atoms";
import { toast } from "sonner";
import { formatSecureSeatInterest } from "@/constants/secure-seat-interest";
import {
  formatRegistrationPackage,
} from "@/constants/registration-offers";
import type { ProgramType } from "@/services/programs.service";
import { formatCurrency } from "@/utils/currency";
import { SeeMoreText } from "@/components/molecules/see-more-text";

interface ParticipantsColumnsProps {
  programType?: ProgramType | null;
  onAddPayment?: (participant: Participant) => void;
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
}

async function copyText(value: string, successMessage: string) {
  try {
    await navigator.clipboard.writeText(value);
    toast.success(successMessage);
  } catch {
    toast.error("Failed to copy");
  }
}

function CopyablePackageValue({
  value,
  successMessage,
  title,
  icon: Icon,
}: {
  value: string;
  successMessage: string;
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={() => copyText(value, successMessage)}
      className="group flex w-full max-w-full items-center gap-1.5 text-left"
      title={title}
    >
      {Icon ? (
        <Icon className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
      ) : null}
      <Typography
        variant="label"
        className="min-w-0 flex-1 truncate normal-case text-muted-foreground group-hover:text-primary"
      >
        {value}
      </Typography>
      <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

function ParticipantPackageCell({
  participant,
}: {
  participant: Participant;
}) {
  const packageLabel = formatRegistrationPackage(participant.selected_package);
  const priceLabel =
    participant.package_price != null
      ? formatCurrency(participant.package_price)
      : null;
  const isBarengTeman = participant.selected_package === "bareng_teman";
  const hasPackage = packageLabel !== "—";
  const friendName = participant.friend_name?.trim()
    ? toTitleCase(participant.friend_name)
    : null;
  const friendPhone = participant.friend_phone?.trim() || null;

  if (!hasPackage && priceLabel == null) {
    return (
      <Typography variant="body3" className="normal-case text-muted-foreground">
        —
      </Typography>
    );
  }

  return (
    <div className="min-w-0 rounded-lg border border-border/50 bg-muted/20 px-3 py-2.5">
      {hasPackage ? (
        <Typography
          variant="body3"
          className="font-semibold normal-case leading-snug text-primary"
        >
          {packageLabel}
        </Typography>
      ) : null}
      {priceLabel ? (
        <Typography
          variant="label"
          className="mt-0.5 font-semibold normal-case tabular-nums text-brand-royal"
        >
          {priceLabel}
        </Typography>
      ) : null}

      {isBarengTeman ? (
        <>
          <div className="my-2 border-t border-border/40" />
          <div className="flex flex-col gap-0.5">
            {friendName ? (
              <CopyablePackageValue
                value={friendName}
                successMessage="Friend name copied to clipboard"
                title="Copy friend name"
                icon={UserRound}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <UserRound
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <Typography
                  variant="label"
                  className="normal-case text-muted-foreground"
                >
                  —
                </Typography>
              </div>
            )}
            {friendPhone ? (
              <CopyablePackageValue
                value={friendPhone}
                successMessage="Friend WhatsApp copied to clipboard"
                title="Copy friend WhatsApp"
                icon={Phone}
              />
            ) : (
              <div className="flex items-center gap-1.5">
                <Phone
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <Typography
                  variant="label"
                  className="normal-case text-muted-foreground"
                >
                  —
                </Typography>
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}

function canAddPayment(participant: Participant): boolean {
  const status = participant.payment_status;
  return status !== "paid" && status !== "on_progress";
}

export function participantsColumns({
  programType,
  onAddPayment,
  onEdit,
  onDelete,
}: ParticipantsColumnsProps): ColumnDef<Participant>[] {
  const isWorkshop = programType === "workshop";

  const columns: ColumnDef<Participant>[] = [
    {
      accessorKey: "name",
      header: "Participant",
      enableSorting: true,
      minSize: 160,
      maxSize: 280,
      cell: (participant) => {
        const displayName = emptyFallback(participant.name);
        const hasName = Boolean(participant.name?.trim());

        return (
          <div className="flex flex-col gap-0.5">
            {hasName ? (
              <button
                type="button"
                onClick={() =>
                  copyText(
                    toTitleCase(participant.name),
                    "Name copied to clipboard",
                  )
                }
                className="group inline-flex max-w-full items-center gap-1 text-left"
                title="Copy name"
              >
                <Typography
                  variant="body3"
                  className="font-semibold capitalize text-primary"
                >
                  {displayName}
                </Typography>
                <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ) : (
              <Typography
                variant="body3"
                className="font-semibold capitalize text-primary"
              >
                {displayName}
              </Typography>
            )}
            {participant.email ? (
              <button
                type="button"
                onClick={() =>
                  copyText(participant.email!, "Email copied to clipboard")
                }
                className="group inline-flex max-w-full items-center gap-1.5 text-left"
                title="Copy email"
              >
                <Mail
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
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
              <button
                type="button"
                onClick={() =>
                  copyText(participant.phone!, "Phone copied to clipboard")
                }
                className="group inline-flex max-w-full items-center gap-1.5 text-left"
                title="Copy phone"
              >
                <Phone
                  className="h-3 w-3 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <Typography
                  variant="label"
                  className="normal-case text-muted-foreground group-hover:text-primary"
                >
                  {participant.phone}
                </Typography>
                <Copy className="h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            ) : null}
          </div>
        );
      },
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
  ];

  if (isWorkshop) {
    columns.push({
      accessorKey: "secure_seat_interest",
      header: "Secure Seat",
      enableSorting: true,
      minSize: 140,
      maxSize: 260,
      cell: (participant) => (
        <Typography variant="body3" className="normal-case">
          {formatSecureSeatInterest(participant.secure_seat_interest)}
        </Typography>
      ),
    });
  } else {
    columns.push(
      {
        accessorKey: "registration_source",
        header: "Source",
        enableSorting: true,
        minSize: 100,
        maxSize: 140,
        cell: (participant) => (
          <RegistrationSourceBadge source={participant.registration_source} />
        ),
      },
      {
        accessorKey: "selected_package",
        header: "Package",
        enableSorting: true,
        size: 280,
        minSize: 220,
        maxSize: 380,
        cell: (participant) => (
          <ParticipantPackageCell participant={participant} />
        ),
      },
    );
  }

  columns.push(
    {
      accessorKey: "notes",
      header: "Notes",
      enableSorting: true,
      size: 280,
      minSize: 180,
      maxSize: 360,
      cell: (participant) => <SeeMoreText text={participant.notes} />,
    },
    {
      accessorKey: "created_at",
      header: "Joined Date",
      enableSorting: true,
      minSize: 120,
      maxSize: 160,
      cell: (participant) => {
        const joinedAt = participant.created_at ?? participant.joined_date;
        return (
          <Typography variant="body3" className="whitespace-nowrap">
            {emptyFallback(joinedAt ? formatDateTime(joinedAt) : "")}
          </Typography>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      // 3 icon buttons (payment + edit + delete); default sticky actions width is 88px
      size: 120,
      minSize: 120,
      maxSize: 120,
      cell: (participant) => (
        <div className="flex items-center gap-1">
          {onAddPayment && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onAddPayment(participant)}
              disabled={!canAddPayment(participant)}
              className="h-8 w-8 text-primary hover:text-primary disabled:opacity-40"
            >
              <Banknote className="h-4 w-4" />
              <span className="sr-only">Add payment</span>
            </Button>
          )}
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
  );

  return columns;
}
