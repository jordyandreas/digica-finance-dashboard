"use client";

import { useEffect, useState } from "react";
import { DEFAULT_PAGE_SIZE } from "@/components/molecules/data-table/data-table-pagination-control";
import {
  ARTICLE_CATEGORY_ALL,
  ARTICLE_STATUS_ALL,
  type ArticleCategory,
  type ArticleStatus,
} from "@/constants/article-categories";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { ArticlesContent } from "./_components/articles-content";
import { useArticlesPaginated } from "./_hooks/use-articles";

export default function ArticlesPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ARTICLE_STATUS_ALL);
  const [categoryFilter, setCategoryFilter] =
    useState<string>(ARTICLE_CATEGORY_ALL);
  const debouncedSearch = useDebouncedValue(search);
  const statusParam =
    statusFilter === ARTICLE_STATUS_ALL
      ? "all"
      : (statusFilter as ArticleStatus);
  const categoryParam =
    categoryFilter === ARTICLE_CATEGORY_ALL
      ? "all"
      : (categoryFilter as ArticleCategory);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, categoryFilter]);

  const {
    data: articlesResult,
    error,
    isPending,
    isFetching,
  } = useArticlesPaginated(
    page,
    limit,
    statusParam,
    categoryParam,
    debouncedSearch,
  );

  return (
    <ArticlesContent
      articles={articlesResult?.data ?? []}
      pagination={articlesResult?.pagination}
      page={page}
      limit={limit}
      search={search}
      statusFilter={statusFilter}
      categoryFilter={categoryFilter}
      onSearchChange={setSearch}
      onStatusFilterChange={setStatusFilter}
      onCategoryFilterChange={setCategoryFilter}
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
