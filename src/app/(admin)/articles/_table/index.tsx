"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/molecules/data-table";
import type { LmsArticle } from "@/services/articles.service";
import { articlesColumns } from "./columns";

interface ArticlesTableProps {
  data: LmsArticle[];
  onEdit: (article: LmsArticle) => void;
  onPublish: (article: LmsArticle) => void;
  onDelete: (article: LmsArticle) => void;
  publishingArticleId?: string | null;
}

export function ArticlesTable({
  data,
  onEdit,
  onPublish,
  onDelete,
  publishingArticleId,
}: ArticlesTableProps) {
  const router = useRouter();
  const columns = articlesColumns({
    onEdit,
    onPublish,
    onDelete,
    publishingArticleId,
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(article) => article.id}
      onRowClick={(article) => router.push(`/articles/${article.id}/edit`)}
    />
  );
}
