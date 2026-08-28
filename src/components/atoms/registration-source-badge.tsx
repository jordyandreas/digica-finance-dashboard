import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  formatRegistrationSource,
  isRegistrationSource,
  type RegistrationSource,
} from "@/constants/registration-offers";
import { Megaphone, Share2, type LucideIcon } from "lucide-react";

interface RegistrationSourceBadgeProps {
  source?: string | null;
  className?: string;
}

const pill = (bg: string, text: string) =>
  `${bg} ${text} border-transparent`;

const SOURCE_STYLES: Record<RegistrationSource, string> = {
  workshop_promo: pill("bg-indigo-100", "text-indigo-800"),
  social: pill("bg-fuchsia-100", "text-fuchsia-800"),
};

const SOURCE_ICONS: Record<RegistrationSource, LucideIcon> = {
  workshop_promo: Megaphone,
  social: Share2,
};

const DEFAULT_STYLE = pill("bg-slate-100", "text-slate-600");

export function RegistrationSourceBadge({
  source,
  className,
}: RegistrationSourceBadgeProps) {
  const label = formatRegistrationSource(source);

  if (label === "—") {
    return <span className="text-xs text-muted-foreground">—</span>;
  }

  const isKnown = isRegistrationSource(source);
  const normalized = isKnown ? source : "";
  const variant = isKnown
    ? SOURCE_STYLES[normalized as RegistrationSource]
    : DEFAULT_STYLE;
  const Icon = isKnown ? SOURCE_ICONS[normalized as RegistrationSource] : null;

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
