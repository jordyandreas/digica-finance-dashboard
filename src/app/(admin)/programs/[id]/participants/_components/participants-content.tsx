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
import {
  REGISTRATION_PACKAGE_ALL,
  REGISTRATION_PACKAGE_FILTER_OPTIONS,
  REGISTRATION_SOURCE_ALL,
  REGISTRATION_SOURCE_FILTER_OPTIONS,
} from "@/constants/registration-offers";
import { Copy, Download, Plus } from "lucide-react";
import { useAddParticipant } from "../_hooks/use-add-participant";
import { useParticipantsActions } from "../_hooks/use-participants-actions";
import { ParticipantsTable } from "../_table";

interface ParticipantsContentProps {
  participants: Participant[];
  pagination?: PaginationMeta;
  programId: string;
  programType?: ProgramType | null;
  programName?: string | null;
  programSlug?: string | null;
  bootcampRegistrationLink?: string | null;
  page: number;
  limit: number;
  search: string;
  status: string;
  secureSeatInterest: string;
  registrationSource: string;
  selectedPackage: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSecureSeatInterestChange: (value: string) => void;
  onRegistrationSourceChange: (value: string) => void;
  onSelectedPackageChange: (value: string) => void;
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
  programName,
  programSlug,
  bootcampRegistrationLink,
  page,
  limit,
  search,
  status,
  secureSeatInterest,
  registrationSource,
  selectedPackage,
  onSearchChange,
  onStatusChange,
  onSecureSeatInterestChange,
  onRegistrationSourceChange,
  onSelectedPackageChange,
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
  const {
    exportParticipants,
    bootcampRegistrationUrl,
    handleCopyBootcampRegistrationLink,
    handleExportCsv,
  } = useParticipantsActions({
    programId,
    programSlug,
    programName,
    bootcampRegistrationLink,
  });
  const showSkeleton = isPending && participants.length === 0;
  const isWorkshop = programType === "workshop";
  const skeletonColumns = isWorkshop ? 8 : 9;
  const showYesFollowUpCallout = isWorkshop && secureSeatInterest === "yes";

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
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
                  : {
                      secondaryFilter: registrationSource,
                      onSecondaryFilterChange: onRegistrationSourceChange,
                      secondaryFilterOptions: [
                        ...REGISTRATION_SOURCE_FILTER_OPTIONS,
                      ],
                      secondaryFilterPlaceholder: "Source",
                      secondaryFilterAllValue: REGISTRATION_SOURCE_ALL,
                      tertiaryFilter: selectedPackage,
                      onTertiaryFilterChange: onSelectedPackageChange,
                      tertiaryFilterOptions: [
                        ...REGISTRATION_PACKAGE_FILTER_OPTIONS,
                      ],
                      tertiaryFilterPlaceholder: "Package",
                      tertiaryFilterAllValue: REGISTRATION_PACKAGE_ALL,
                    })}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              className="shrink-0 self-end sm:self-start"
              onClick={handleExportCsv}
              disabled={showSkeleton || exportParticipants.length === 0}
            >
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>

          {showYesFollowUpCallout ? (
            <div className="flex flex-col gap-3 rounded-xl border border-brand-periwinkle/60 bg-brand-pale/25 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-deep">
                These participants showed promo interest. Follow up if they have
                not registered on the linked bootcamp yet.
              </p>
              {bootcampRegistrationUrl ? (
                <Button
                  type="button"
                  variant="outline"
                  className="shrink-0"
                  onClick={handleCopyBootcampRegistrationLink}
                >
                  <Copy className="h-4 w-4" />
                  Copy link daftar bootcamp
                </Button>
              ) : (
                <p className="text-xs text-muted-foreground sm:text-right">
                  Set the bootcamp registration link on this workshop to copy it
                  here.
                </p>
              )}
            </div>
          ) : null}

          <Card
            className={
              isFetching && !showSkeleton
                ? "opacity-60 transition-opacity"
                : undefined
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
