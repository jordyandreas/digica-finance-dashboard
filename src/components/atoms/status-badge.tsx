import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const pill = (bg: string, text: string, border: string) =>
  `${bg} ${text} ${border}`;

const STATUS_STYLES: Record<string, string> = {
  // Payment
  paid: pill(
    "bg-emerald-500/15",
    "text-emerald-800",
    "border-emerald-500/30",
  ),
  pending: pill(
    "bg-amber-500/15",
    "text-amber-800",
    "border-amber-500/30",
  ),
  failed: pill("bg-rose-500/15", "text-rose-700", "border-rose-500/30"),
  refunded: pill("bg-blue-500/15", "text-blue-800", "border-blue-500/30"),

  // Participant & program lifecycle
  active: pill("bg-sky-500/15", "text-sky-800", "border-sky-500/30"),
  completed: pill(
    "bg-emerald-500/15",
    "text-emerald-800",
    "border-emerald-500/30",
  ),
  dropout: pill("bg-rose-500/15", "text-rose-700", "border-rose-500/30"),
  draft: pill("bg-slate-500/10", "text-slate-600", "border-slate-500/25"),
};

const DEFAULT_STYLE = pill(
  "bg-slate-500/10",
  "text-slate-600",
  "border-slate-500/25",
);

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  const variant = STATUS_STYLES[normalized] ?? DEFAULT_STYLE;

  return (
    <Badge className={cn(variant, "uppercase font-semibold", className)}>
      {status || "—"}
    </Badge>
  );
}
