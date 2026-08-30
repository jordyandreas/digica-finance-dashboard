import { Badge } from "@/components/ui/badge";
import {
  ARTICLE_CATEGORY_ICONS,
  ARTICLE_CATEGORY_STYLES,
  isArticleCategory,
  type ArticleCategory,
} from "@/constants/article-categories";
import { cn } from "@/lib/utils";

interface ArticleCategoryBadgeProps {
  category?: string | null;
  className?: string;
}

const DEFAULT_STYLE = "bg-slate-100 text-slate-600 border-transparent";

export function ArticleCategoryBadge({
  category,
  className,
}: ArticleCategoryBadgeProps) {
  const label = category?.trim() || "—";

  if (label === "—") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const isKnown = isArticleCategory(label);
  const normalized = isKnown ? (label as ArticleCategory) : null;
  const variant = normalized
    ? ARTICLE_CATEGORY_STYLES[normalized]
    : DEFAULT_STYLE;
  const Icon = normalized ? ARTICLE_CATEGORY_ICONS[normalized] : null;

  return (
    <Badge
      className={cn(
        variant,
        "rounded-full px-3 py-1 text-xs font-medium normal-case",
        className,
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {Icon ? <Icon className="h-3 w-3 shrink-0" aria-hidden /> : null}
        {label}
      </span>
    </Badge>
  );
}
