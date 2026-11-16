"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  COURSE_LEVEL_ALL,
  COURSE_STATUS_ALL,
  type CourseLevel,
  type CourseStatus,
} from "@/constants/course-levels";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { CoursesContent } from "./_components/courses-content";
import { useCoursesPaginated } from "./_hooks/use-courses";

export default function CoursesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(COURSE_STATUS_ALL);
  const [levelFilter, setLevelFilter] = useState<string>(COURSE_LEVEL_ALL);
  const debouncedSearch = useDebouncedValue(search);
  const statusParam =
    statusFilter === COURSE_STATUS_ALL
      ? "all"
      : (statusFilter as CourseStatus);
  const levelParam =
    levelFilter === COURSE_LEVEL_ALL ? "all" : (levelFilter as CourseLevel);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, levelFilter]);

  const {
    data: coursesResult,
    error,
    isPending,
    isFetching,
  } = useCoursesPaginated(page, limit, statusParam, levelParam, debouncedSearch);

  return (
    <CoursesContent
      courses={coursesResult?.data ?? []}
      pagination={coursesResult?.pagination}
      page={page}
      limit={limit}
      search={search}
      statusFilter={statusFilter}
      levelFilter={levelFilter}
      onSearchChange={setSearch}
      onStatusFilterChange={setStatusFilter}
      onLevelFilterChange={setLevelFilter}
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
