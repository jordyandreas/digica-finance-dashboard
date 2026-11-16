"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  ENTITLEMENT_COURSE_ALL,
  ENTITLEMENT_STATUS_ALL,
  type EntitlementStatus,
} from "@/constants/entitlement-status";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useCourseOptions } from "../courses/_hooks/use-courses";
import { EntitlementsContent } from "./_components/entitlements-content";
import { useEntitlementsPaginated } from "./_hooks/use-entitlements";

export default function EntitlementsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(
    ENTITLEMENT_STATUS_ALL,
  );
  const [courseFilter, setCourseFilter] = useState<string>(
    ENTITLEMENT_COURSE_ALL,
  );
  const debouncedSearch = useDebouncedValue(search);
  const statusParam =
    statusFilter === ENTITLEMENT_STATUS_ALL
      ? "all"
      : (statusFilter as EntitlementStatus);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, courseFilter]);

  const { data: courses = [] } = useCourseOptions();
  const {
    data: entitlementsResult,
    error,
    isPending,
    isFetching,
  } = useEntitlementsPaginated(
    page,
    limit,
    courseFilter,
    statusParam,
    debouncedSearch,
  );

  return (
    <EntitlementsContent
      entitlements={entitlementsResult?.data ?? []}
      courses={courses}
      pagination={entitlementsResult?.pagination}
      page={page}
      limit={limit}
      search={search}
      statusFilter={statusFilter}
      courseFilter={courseFilter}
      onSearchChange={setSearch}
      onStatusFilterChange={setStatusFilter}
      onCourseFilterChange={setCourseFilter}
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
