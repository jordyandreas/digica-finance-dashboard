"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useParticipantsPaginated } from "./_hooks/use-participants";
import { ParticipantsContent } from "./_components/participants-content";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(PAYMENT_STATUS_ALL);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status]);

  const {
    data: participantsResult,
    error,
    isPending,
    isFetching,
  } = useParticipantsPaginated(programId, {
    page,
    limit,
    search: debouncedSearch,
    status,
  });

  return (
    <ParticipantsContent
      participants={participantsResult?.data ?? []}
      pagination={participantsResult?.pagination}
      programId={programId}
      page={page}
      limit={limit}
      search={search}
      status={status}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
      onPageChange={setPage}
      onLimitChange={(nextLimit) => {
        setLimit(nextLimit);
        setPage(1);
      }}
      error={error}
      isPending={isPending}
      isFetching={isFetching}
    />
  );
}
