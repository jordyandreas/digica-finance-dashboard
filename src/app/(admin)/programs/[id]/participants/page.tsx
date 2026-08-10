"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useParticipantsPaginated } from "./_hooks/use-participants";
import { ParticipantsContent } from "./_components/participants-content";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import { SECURE_SEAT_INTEREST_ALL } from "@/constants/secure-seat-interest";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useProgram } from "../_hooks/useProgram";

export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? "";
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(PAYMENT_STATUS_ALL);
  const [secureSeatInterest, setSecureSeatInterest] = useState(
    SECURE_SEAT_INTEREST_ALL,
  );
  const debouncedSearch = useDebouncedValue(search);
  const { data: program } = useProgram(programId);
  const isWorkshop = program?.type === "workshop";

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, secureSeatInterest]);

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
    secureSeatInterest: isWorkshop
      ? secureSeatInterest
      : SECURE_SEAT_INTEREST_ALL,
  });

  return (
    <ParticipantsContent
      participants={participantsResult?.data ?? []}
      pagination={participantsResult?.pagination}
      programId={programId}
      programType={program?.type}
      programName={program?.name}
      programSlug={program?.public_slug}
      bootcampRegistrationLink={program?.bootcamp_registration_link}
      page={page}
      limit={limit}
      search={search}
      status={status}
      secureSeatInterest={secureSeatInterest}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
      onSecureSeatInterestChange={setSecureSeatInterest}
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
