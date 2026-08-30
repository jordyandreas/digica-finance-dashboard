import type { LmsArticle } from "@/services/articles.service";

export function canPublishArticle(article: LmsArticle): boolean {
  return article.status === "draft";
}

export function canDeleteArticle(article: LmsArticle): boolean {
  return article.status !== "published";
}
