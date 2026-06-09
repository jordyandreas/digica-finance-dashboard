"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  DataTableFilters,
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  PAYMENT_STATUS_ALL,
  PAYMENT_STATUS_FILTER_OPTIONS,
} from "@/constants/payment-status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { formatCurrency } from "@/utils/currency";
import { usePaymentsPaginated, usePaymentsSummary } from "./_hooks/use-payments";
import { useAddPayment } from "./_hooks/use-add-payment";
import { useParticipants } from "../participants/_hooks/use-participants";
import { PaymentsTable } from "./_table";

export default function PaymentsPage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : id ?? "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(PAYMENT_STATUS_ALL);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const {
    data: paymentsResult,
    isPending: isPaymentsPending,
    isFetching: isPaymentsFetching,
  } = usePaymentsPaginated(programId, {
    page,
    limit,
    search: debouncedSearch,
    status,
  });
  const payments = paymentsResult?.data ?? [];
  const showPaymentsSkeleton = isPaymentsPending && payments.length === 0;
  const { data: summary } = usePaymentsSummary(programId);
  const { data: participants } = useParticipants(programId);

  const { handleAddClick, handleEdit, handleDelete, deleteConfirmation } =
    useAddPayment({ programId });

  const totalAmount = summary?.total || 0;
  const participantNamesById = Object.fromEntries(
    (participants ?? []).map((participant) => [
      participant.id,
      participant.name || "Unnamed participant",
    ]),
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Track all incoming payments</p>
        </div>
        <Button onClick={handleAddClick}>
          <Plus className="h-4 w-4" />
          Add Payment
        </Button>
      </div>

      <>
          <Card>
            <CardHeader>
              <CardTitle>Total Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-brand-royal">
                {formatCurrency(totalAmount)}
              </div>
              <p className="text-sm text-muted-foreground">
                {summary?.count || 0} payment
                {summary?.count !== 1 ? "s" : ""} recorded
              </p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <DataTableFilters
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search participant name"
              status={status}
              onStatusChange={setStatus}
              statusOptions={PAYMENT_STATUS_FILTER_OPTIONS}
              statusPlaceholder="Status"
            />
            <Card
              className={
                isPaymentsFetching && !showPaymentsSkeleton
                  ? "opacity-60 transition-opacity"
                  : undefined
              }
            >
              {showPaymentsSkeleton ? (
                <DataTableSkeleton rows={limit} columns={9} />
              ) : (
                <>
                  <PaymentsTable
                    data={payments}
                    participantNamesById={participantNamesById}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                  <DataTablePaginationControl
                    currentPage={paymentsResult?.pagination.page ?? page}
                    totalPages={paymentsResult?.pagination.total_page ?? 1}
                    onPageChange={setPage}
                    pageSize={limit}
                    onPageSizeChange={(nextLimit) => {
                      setLimit(nextLimit);
                      setPage(1);
                    }}
                  />
                </>
              )}
            </Card>
          </div>
      </>

      <DeleteConfirmationModal
        open={deleteConfirmation.isOpen}
        onOpenChange={deleteConfirmation.setOpen}
        title={deleteConfirmation.title}
        description={deleteConfirmation.description}
        onConfirm={deleteConfirmation.onConfirm}
        isLoading={deleteConfirmation.isDeleting}
      />
    </div>
  );
}