'use client';

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { resolveRegistrationLink } from "@/utils/program-public";
import {
  resolvePublicAppOrigin,
  resolvePublicIdentifier,
} from "@/utils/program-public-link";
import {
  formatProgramShortDateRange,
  formatProgramShortTimeRange,
  formatProgramType,
} from "@/utils/programs";
import { emptyFallback } from "@/utils/string";
import { ParticipantLinkRow } from "./participant-link-row";
import { useProgram } from "../_hooks/useProgram";

type ProgramOverviewProps = {
  programId: string;
  totalParticipants?: number;
};

export function ProgramOverview({
  programId,
}: ProgramOverviewProps) {

  const { data: program, isLoading } = useProgram(programId);
  const title = isLoading ? "Loading..." : program?.name || "Program Details";
  const [isOpen, setIsOpen] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(resolvePublicAppOrigin(window.location.origin));
  }, []);

  const registrationUrl = resolveRegistrationLink(
    program?.registration_link,
    origin,
    program?.public_code
      ? {
          public_code: program.public_code,
          public_slug: program.public_slug,
        }
      : null,
  );

  const registrationFallback = program?.public_code
    ? `/r/${resolvePublicIdentifier({
        public_code: program.public_code,
        public_slug: program.public_slug,
      })}`
    : `/registration/${programId}`;

  const waGroupUrl = program?.wa_group_link?.trim() ?? "";

  return (
    <div className="w-full space-y-4">
      <div>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">
        Overview of program performance and activity
      </p>
    </div>
    <Card>
      <CardHeader className={cn("space-y-0", !isOpen && "pb-6")}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm"
        >
          <CardTitle className="text-2xl font-semibold leading-none tracking-tight">
            Overview
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isOpen && (
      <CardContent>
        <dl className="grid gap-4 sm:grid-cols-3">
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Type
            </Typography>
            <Typography variant="body2" tagName="dd">
              {emptyFallback(formatProgramType(program?.type))}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Status
            </Typography>
            <Typography variant="body2" tagName="dd">
              <StatusBadge status={program?.status ?? "Unknown"} />
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Sessions
            </Typography>
            <Typography variant="body2" tagName="dd">
              {program?.session_count != null && program.session_count > 0
                ? program.session_count
                : "—"}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Date
            </Typography>
            <Typography variant="body2" tagName="dd">
              {formatProgramShortDateRange(
                program?.start_date ?? null,
                program?.end_date ?? null,
              )}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Time
            </Typography>
            <Typography variant="body2" tagName="dd">
              {(() => {
                const timeRange = formatProgramShortTimeRange(
                  program?.start_time ?? null,
                  program?.end_time ?? null,
                );
                return timeRange === "—" ? timeRange : `${timeRange} WIB`;
              })()}
            </Typography>
          </div>
          <div className="hidden sm:block" aria-hidden />
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Default Price
            </Typography>
            <Typography variant="body2" tagName="dd">
              {program?.price != null ? formatCurrency(program.price) : "—"}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Promo Individual
            </Typography>
            <Typography variant="body2" tagName="dd">
              {program?.promo_individual_price != null
                ? formatCurrency(program.promo_individual_price)
                : "—"}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              Promo Bareng teman
            </Typography>
            <Typography variant="body2" tagName="dd">
              {program?.promo_bareng_teman_price != null
                ? formatCurrency(program.promo_bareng_teman_price)
                : "—"}
            </Typography>
          </div>
        </dl>

        <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-2">
          <ParticipantLinkRow
            label="Registration link"
            url={registrationUrl}
            fallback={registrationFallback}
            successMessage="Registration link copied to clipboard"
          />
          <ParticipantLinkRow
            label="WhatsApp group link"
            url={waGroupUrl}
            emptyLabel="Not configured"
            successMessage="WhatsApp group link copied to clipboard"
          />
        </div>
      </CardContent>
      )}
    </Card>
    </div>
  );
}
