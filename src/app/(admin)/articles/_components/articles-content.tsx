"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Card } from "@/components/ui/card";
import {
  DataTableFilters,
  DataTablePaginationControl,
  DataTableSkeleton,
} from "@/components/molecules/data-table";
import { DeleteConfirmationModal } from "@/components/molecules/modals/delete-confirmation-modal";
import {
  ARTICLE_CATEGORY_ALL,
  ARTICLE_CATEGORY_FILTER_OPTIONS,
  ARTICLE_STATUS_FILTER_OPTIONS,
} from "@/constants/article-categories";
import type { LmsArticle } from "@/services/articles.service";
import { type PaginationMeta } from "@/types/pagination";
import { ArticlesTable } from "../_table";
import { useArticlesActions } from "../_hooks/use-articles-actions";

interface ArticlesContentProps {
  articles: LmsArticle[];
  pagination?: PaginationMeta;
  page: number;
  limit: number;
  search: string;
  statusFilter: string;
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  error?: Error | null;
  isPending?: boolean;
  isFetching?: boolean;
}

export function ArticlesContent({
  articles,
  pagination,
  page,
  limit,
  search,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onPageChange,
  onLimitChange,
  error,
  isPending = false,
  isFetching = false,
}: ArticlesContentProps) {
  const {
    handleEdit,
    handlePublish,
    handleDelete,
    handleConfirmDelete,
    publishingArticleId,
    deleteConfirmation,
    isDeletePending,
  } = useArticlesActions();
  const showSkeleton = isPending && articles.length === 0;

  return (
    <>
      <div className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Articles</h1>
            <p className="text-muted-foreground">
              Total {pagination?.total ?? articles.length} article
              {(pagination?.total ?? articles.length) === 1 ? "" : "s"}
            </p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/articles/new">
              <Plus className="h-4 w-4" />
              New article
            </Link>
          </Button>
        </div>

        <div className="space-y-3">
          <DataTableFilters
            search={search}
            onSearchChange={onSearchChange}
            searchPlaceholder="Search title, slug, or excerpt"
            status={statusFilter}
            onStatusChange={onStatusFilterChange}
            statusOptions={[...ARTICLE_STATUS_FILTER_OPTIONS]}
            statusPlaceholder="Status"
            secondaryFilter={categoryFilter}
            onSecondaryFilterChange={onCategoryFilterChange}
            secondaryFilterOptions={[...ARTICLE_CATEGORY_FILTER_OPTIONS]}
            secondaryFilterPlaceholder="Category"
            secondaryFilterAllValue={ARTICLE_CATEGORY_ALL}
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
                  Error loading articles
                </p>
                <p className="mt-1 text-muted-foreground">
                  {error instanceof Error ? error.message : "Unknown error"}
                </p>
              </div>
            ) : showSkeleton ? (
              <DataTableSkeleton rows={limit} columns={7} />
            ) : (
              <>
                <ArticlesTable
                  data={articles}
                  onEdit={handleEdit}
                  onPublish={handlePublish}
                  onDelete={handleDelete}
                  publishingArticleId={publishingArticleId}
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
        onConfirm={handleConfirmDelete}
        isLoading={isDeletePending}
      />
    </>
  );
}
