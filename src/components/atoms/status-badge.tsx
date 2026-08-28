import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  PAYMENT_STATUSES,
  formatPaymentStatusLabel,
} from "@/constants/payment-status";
import {
  CircleCheck,
  CircleX,
  Clock,
  LoaderCircle,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";

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

const PAYMENT_STATUS_SET = new Set<string>(PAYMENT_STATUSES);

const PAYMENT_STATUS_ICONS: Record<(typeof PAYMENT_STATUSES)[number], LucideIcon> =
  {
    pending: Clock,
    paid: CircleCheck,
    on_progress: LoaderCircle,
    failed: CircleX,
    refunded: RotateCcw,
  };

const DEFAULT_STYLE = pill("bg-slate-100", "text-slate-600");

function isPaymentStatus(
  status: string,
): status is (typeof PAYMENT_STATUSES)[number] {
  return PAYMENT_STATUS_SET.has(status);
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const normalized = (status || "").trim().toLowerCase();
  const variant = STATUS_STYLES[normalized] ?? DEFAULT_STYLE;
  const isPayment = isPaymentStatus(normalized);
  const Icon = isPayment ? PAYMENT_STATUS_ICONS[normalized] : null;
  const label = isPayment
    ? formatPaymentStatusLabel(status)
    : status?.replace(/_/g, " ") || "—";

  return (
    <Badge
      className={cn(
        variant,
        "rounded-full px-3 py-1 text-xs font-medium",
        isPayment ? "normal-case" : "uppercase tracking-wide",
        className,
      )}
    >
      {Icon ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon className="h-3 w-3 shrink-0" aria-hidden />
          {label}
        </span>
      ) : (
        label
      )}
    </Badge>
  );
}
