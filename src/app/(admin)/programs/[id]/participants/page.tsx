"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useParticipantsPaginated } from "./_hooks/use-participants";
import { ParticipantsContent } from "./_components/participants-content";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import { PAYMENT_STATUS_ALL } from "@/constants/payment-status";
import {
  REGISTRATION_PACKAGE_ALL,
  REGISTRATION_SOURCE_ALL,
} from "@/constants/registration-offers";
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
  const [registrationSource, setRegistrationSource] = useState(
    REGISTRATION_SOURCE_ALL,
  );
  const [selectedPackage, setSelectedPackage] = useState(
    REGISTRATION_PACKAGE_ALL,
  );
  const debouncedSearch = useDebouncedValue(search);
  const { data: program } = useProgram(programId);
  const isWorkshop = program?.type === "workshop";

  useEffect(() => {
    setPage(1);
  }, [
    debouncedSearch,
    status,
    secureSeatInterest,
    registrationSource,
    selectedPackage,
  ]);

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
    registrationSource: isWorkshop
      ? REGISTRATION_SOURCE_ALL
      : registrationSource,
    selectedPackage: isWorkshop ? REGISTRATION_PACKAGE_ALL : selectedPackage,
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
      registrationSource={registrationSource}
      selectedPackage={selectedPackage}
      onSearchChange={setSearch}
      onStatusChange={setStatus}
      onSecureSeatInterestChange={setSecureSeatInterest}
      onRegistrationSourceChange={setRegistrationSource}
      onSelectedPackageChange={setSelectedPackage}
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
