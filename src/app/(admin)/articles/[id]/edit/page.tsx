"use client";

import { useParams } from "next/navigation";
import { ArticleEditor } from "../../_components/article-editor";
import { useArticle } from "../../_hooks/use-articles";

export default function EditArticlePage() {
  const params = useParams<{ id: string }>();
  const articleId = params.id;
  const { data: article, isLoading, error } = useArticle(articleId);

  if (isLoading) {
    return (
      <div className="text-muted-foreground">Loading article...</div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-4">
        <p className="text-destructive">Article not found.</p>
      </div>
    );
  }

  return <ArticleEditor article={article} />;
}
