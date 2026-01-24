import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status?: string | null;
  className?: string;
}

const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  completed: "bg-blue-500/15 text-blue-700 border-blue-500/30",
  dropout: "bg-rose-500/15 text-rose-700 border-rose-500/30",
  pending: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  paid: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  refunded: "bg-slate-500/15 text-slate-700 border-slate-500/30",
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  const variant =
    STATUS_STYLES[normalized] ||
    "bg-slate-500/15 text-slate-700 border-slate-500/30";

  return (
    <Badge className={cn(variant,'uppercase font-semibold', className)}>
      {status || "—"}
    </Badge>
  );
}
