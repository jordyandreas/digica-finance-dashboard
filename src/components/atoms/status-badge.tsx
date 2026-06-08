import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const pill = (bg: string, text: string) =>
  `${bg} ${text} border-transparent`;

const STATUS_STYLES: Record<string, string> = {
  // Payment
  paid: pill("bg-emerald-100", "text-emerald-700"),
  on_progress: pill("bg-sky-100", "text-sky-700"),
  pending: pill("bg-amber-100", "text-amber-700"),
  failed: pill("bg-rose-100", "text-rose-700"),
  refunded: pill("bg-blue-100", "text-blue-700"),

  // Participant & program lifecycle
  active: pill("bg-sky-100", "text-sky-700"),
  completed: pill("bg-emerald-100", "text-emerald-700"),
  dropout: pill("bg-rose-100", "text-rose-700"),
  draft: pill("bg-slate-100", "text-slate-600"),
};

const DEFAULT_STYLE = pill("bg-slate-100", "text-slate-600");

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  const variant = STATUS_STYLES[normalized] ?? DEFAULT_STYLE;

  return (
    <Badge
      className={cn(
        variant,
        "rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide",
        className,
      )}
    >
      {status?.replace(/_/g, " ") || "—"}
    </Badge>
  );
}
