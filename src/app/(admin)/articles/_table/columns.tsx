"use client";

import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import { Button } from "@/components/atoms/button";
import { ArticleCategoryBadge } from "@/components/atoms/article-category-badge";
import { StatusBadge } from "@/components/atoms/status-badge";
import { formatDateTime } from "@/utils/date";
import type { LmsArticle } from "@/services/articles.service";
import { Pencil, Send, Trash2 } from "lucide-react";

interface ArticlesColumnsProps {
  onEdit: (article: LmsArticle) => void;
  onPublish: (article: LmsArticle) => void;
  onDelete: (article: LmsArticle) => void;
  publishingArticleId?: string | null;
}

export function articlesColumns({
  onEdit,
  onPublish,
  onDelete,
  publishingArticleId,
}: ArticlesColumnsProps): ColumnDef<LmsArticle>[] {
  return [
    {
      accessorKey: "title",
      header: "Title",
      enableSorting: true,
      cell: (article) => (
        <span className="font-medium">{article.title || "Untitled"}</span>
      ),
    },
    {
      accessorKey: "category",
      header: "Category",
      enableSorting: true,
      cell: (article) => <ArticleCategoryBadge category={article.category} />,
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (article) => <StatusBadge status={article.status} />,
    },
    {
      accessorKey: "slug",
      header: "Slug",
      enableSorting: true,
      cell: (article) => (
        <span className="font-mono text-xs text-muted-foreground">
          {article.slug}
        </span>
      ),
    },
    {
      accessorKey: "published_at",
      header: "Published",
      enableSorting: true,
      cell: (article) => formatDateTime(article.published_at),
    },
    {
      accessorKey: "updated_at",
      header: "Updated",
      enableSorting: true,
      cell: (article) => formatDateTime(article.updated_at),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (article) => (
        <div className="flex justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(article);
            }}
            aria-label={`Edit ${article.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          {article.status === "draft" ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              disabled={publishingArticleId === article.id}
              title={`Publish ${article.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onPublish(article);
              }}
              aria-label={`Publish ${article.title}`}
            >
              <Send className="h-4 w-4 text-emerald-600" />
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={article.status === "published"}
            title={
              article.status === "published"
                ? "Unpublish the article before deleting it"
                : `Delete ${article.title}`
            }
            onClick={(event) => {
              event.stopPropagation();
              onDelete(article);
            }}
            aria-label={`Delete ${article.title}`}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];
}
