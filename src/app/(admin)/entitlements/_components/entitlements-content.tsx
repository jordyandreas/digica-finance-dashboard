"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
  DataTableFilters,
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  ENTITLEMENT_COURSE_ALL,
  ENTITLEMENT_STATUS_FILTER_OPTIONS,
} from "@/constants/entitlement-status";
import { useDeleteConfirmation } from "@/hooks/use-delete-confirmation";
import type { LmsCourse } from "@/services/courses.service";
import type { LmsEntitlementListItem } from "@/services/entitlements.service";
import { type PaginationMeta } from "@/types/pagination";
import { getMutationErrorMessage } from "../../courses/_hooks/use-courses-actions";
import { useEntitlementMutations } from "../_hooks/use-entitlement-mutations";
import { EntitlementsTable } from "../_table";
import { GrantEntitlementForm } from "./grant-entitlement-form";

interface EntitlementsContentProps {
  entitlements: LmsEntitlementListItem[];
  courses: Array<Pick<LmsCourse, "id" | "title" | "status">>;
  pagination?: PaginationMeta;
  page: number;
  limit: number;
  search: string;
  statusFilter: string;
  courseFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCourseFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  error?: Error | null;
  isPending?: boolean;
  isFetching?: boolean;
}

export function EntitlementsContent({
  entitlements,
  courses,
  pagination,
  page,
  limit,
  search,
  statusFilter,
  courseFilter,
  onSearchChange,
  onStatusFilterChange,
  onCourseFilterChange,
  onPageChange,
  onLimitChange,
  error,
  isPending = false,
  isFetching = false,
}: EntitlementsContentProps) {
  const { revokeMutation, updateMutation } = useEntitlementMutations();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const revokeConfirmation = useDeleteConfirmation<LmsEntitlementListItem>({
    title: "Revoke access?",
    description: "The learner will lose access to this course immediately.",
  });
  const showSkeleton = isPending && entitlements.length === 0;
  const total = pagination?.total ?? entitlements.length;

  const handleRevoke = (entitlement: LmsEntitlementListItem) => {
    revokeConfirmation.openConfirmation(
      entitlement,
      `Revoke access for ${entitlement.user_full_name || "this learner"}?`,
      `They will lose access to "${entitlement.course_title ?? "this course"}" immediately. You can reactivate later.`,
    );
  };

  const handleConfirmRevoke = async () => {
    const item = revokeConfirmation.item;
    if (!item) {
      return;
    }

    setPendingId(item.id);
    try {
      await revokeMutation.mutateAsync(item.id);
      toast.success("Access revoked");
      revokeConfirmation.closeConfirmation();
    } catch (revokeError) {
      console.error("Error revoking entitlement:", revokeError);
      toast.error(
        getMutationErrorMessage(revokeError, "Failed to revoke access."),
      );
    } finally {
      setPendingId(null);
    }
  };

  const handleReactivate = async (entitlement: LmsEntitlementListItem) => {
    setPendingId(entitlement.id);
    try {
      const expired =
        entitlement.ends_at && new Date(entitlement.ends_at) <= new Date();
      await updateMutation.mutateAsync({
        id: entitlement.id,
        input: {
          status: "active",
          // An elapsed end date would make the entitlement useless again.
          ...(expired ? { ends_at: null } : {}),
        },
      });
      toast.success("Access reactivated");
    } catch (updateError) {
      console.error("Error reactivating entitlement:", updateError);
      toast.error(
        getMutationErrorMessage(updateError, "Failed to reactivate access."),
      );
    } finally {
      setPendingId(null);
    }
  };

  const courseFilterOptions = [
    { label: "All courses", value: ENTITLEMENT_COURSE_ALL },
    ...courses.map((course) => ({ label: course.title, value: course.id })),
  ];

  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Entitlements</h1>
          <p className="text-muted-foreground">
            Total {total} entitlement{total === 1 ? "" : "s"}
          </p>
        </div>

        <GrantEntitlementForm courses={courses} />

        <div className="space-y-3">
          <DataTableFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search learner, course, or notes"
            status={statusFilter}
            onStatusChange={onStatusFilterChange}
            statusOptions={[...ENTITLEMENT_STATUS_FILTER_OPTIONS]}
            statusPlaceholder="Status"
            secondaryFilter={courseFilter}
            onSecondaryFilterChange={onCourseFilterChange}
            secondaryFilterOptions={courseFilterOptions}
            secondaryFilterPlaceholder="Course"
            secondaryFilterAllValue={ENTITLEMENT_COURSE_ALL}
          />

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
                  Error loading entitlements
                </p>
                <p className="mt-1 text-muted-foreground">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            ) : showSkeleton ? (
              <DataTableSkeleton rows={limit} columns={7} />
            ) : (
              <>
                <EntitlementsTable
                  data={entitlements}
                  onRevoke={handleRevoke}
                  onReactivate={handleReactivate}
                  pendingId={pendingId}
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
        open={revokeConfirmation.isOpen}
        onOpenChange={revokeConfirmation.setOpen}
        title={revokeConfirmation.title}
        description={revokeConfirmation.description}
        confirmLabel="Revoke"
        onConfirm={handleConfirmRevoke}
        isLoading={revokeMutation.isPending}
      />
    </>
  );
}
