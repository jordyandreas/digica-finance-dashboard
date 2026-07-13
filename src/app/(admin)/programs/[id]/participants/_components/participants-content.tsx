"use client";

import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  DataTableFilters,
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { PAYMENT_STATUS_FILTER_OPTIONS } from "@/constants/payment-status";
import {
  SECURE_SEAT_INTEREST_ALL,
  SECURE_SEAT_INTEREST_FILTER_OPTIONS,
} from "@/constants/secure-seat-interest";
import { type Participant } from "@/services/participants.service";
import type { ProgramType } from "@/services/programs.service";
import { type PaginationMeta } from "@/types/pagination";
import { Plus } from "lucide-react";
import { useAddParticipant } from "../_hooks/use-add-participant";
import { useParticipants } from "../_hooks/use-participants";
import { ParticipantsTable } from "../_table";

interface ParticipantsContentProps {
  participants: Participant[];
  pagination?: PaginationMeta;
  programId: string;
  programType?: ProgramType | null;
  page: number;
  limit: number;
  search: string;
  status: string;
  secureSeatInterest: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSecureSeatInterestChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  error?: Error | null;
  isPending?: boolean;
  isFetching?: boolean;
}

export function ParticipantsContent({
  participants,
  pagination,
  programId,
  programType,
  page,
  limit,
  search,
  status,
  secureSeatInterest,
  onSearchChange,
  onStatusChange,
  onSecureSeatInterestChange,
  onPageChange,
  onLimitChange,
  error,
  isPending = false,
  isFetching = false,
}: ParticipantsContentProps) {
  const {
    handleAddClick,
    handleAddPayment,
    handleEdit,
    handleDelete,
    deleteConfirmation,
  } = useAddParticipant({ programId });
  const { data: allParticipants } = useParticipants(programId);
  const participantNamesById = Object.fromEntries(
    (allParticipants ?? []).map((participant) => [
      participant.id,
      participant.name || "Unnamed participant",
    ]),
  );
  const showSkeleton = isPending && participants.length === 0;
  const isWorkshop = programType === "workshop";
  const skeletonColumns = isWorkshop ? 9 : 8;

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Participants</h1>
            <p className="text-muted-foreground">
              Total {pagination?.total ?? participants.length} Participants
            </p>
          </div>
          <Button onClick={handleAddClick}>
            <Plus className="h-4 w-4" />
            Add Participants
          </Button>
        </div>

        <div className="space-y-3">
          <DataTableFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search name, email, or phone"
            status={status}
            onStatusChange={onStatusChange}
            statusOptions={PAYMENT_STATUS_FILTER_OPTIONS}
            statusPlaceholder="Payment status"
            {...(isWorkshop
              ? {
                  secondaryFilter: secureSeatInterest,
                  onSecondaryFilterChange: onSecureSeatInterestChange,
                  secondaryFilterOptions: [
                    ...SECURE_SEAT_INTEREST_FILTER_OPTIONS,
                  ],
                  secondaryFilterPlaceholder: "Secure seat",
                  secondaryFilterAllValue: SECURE_SEAT_INTEREST_ALL,
                }
              : {})}
          />
          <Card
            className={
              isFetching && !showSkeleton ? "opacity-60 transition-opacity" : undefined
            }
          >
            {error ? (
              <div className="border-destructive/50 bg-destructive/10 px-4 py-6 text-sm">
                <p className="font-medium text-destructive">
                  Error loading participants
                </p>
                <p className="mt-1 text-muted-foreground">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            ) : showSkeleton ? (
              <DataTableSkeleton rows={limit} columns={skeletonColumns} />
            ) : (
              <>
                <ParticipantsTable
                  data={participants}
                  programType={programType}
                  participantNamesById={participantNamesById}
                  onAddPayment={handleAddPayment}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
                <DataTablePaginationControl
                  currentPage={pagination?.page ?? page}
                  totalPages={pagination?.total_page ?? 1}
                  onPageChange={onPageChange}
                  pageSize={limit}
                  onPageSizeChange={onLimitChange}
                />
              </>
            )}
          </Card>
        </div>
      </div>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={deleteConfirmation.onConfirm}
        isLoading={deleteConfirmation.isDeleting}
      />
    </>
  );
}
