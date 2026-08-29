"use client";

import { useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Typography } from "@/components/atoms/typography";
import { FinancialVisibilityToggle } from "@/components/molecules/financial-visibility";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useModal } from "@/hooks/use-modal";
import { cn } from "@/lib/utils";
import { PROGRAM_PRICE_TONE_CLASSES } from "@/constants/registration-offers";
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
  formatScheduleDays,
} from "@/utils/programs";
import { appendRegistrationSource } from "@/utils/registration-source-url";
import { emptyFallback } from "@/utils/string";
import { ParticipantLinkRow } from "./participant-link-row";
import { useProgram } from "../_hooks/useProgram";

type ProgramOverviewProps = {
  programId: string;
  totalParticipants?: number;
};

const subscribeToNothing = () => () => undefined;

function getClientOrigin() {
  return resolvePublicAppOrigin(window.location.origin);
}

function getServerOrigin() {
  return resolvePublicAppOrigin();
}

export function ProgramOverview({ programId }: ProgramOverviewProps) {
  const { data: program, isLoading } = useProgram(programId);
  const programModal = useModal<ProgramModalProps>("programModal");
  const title = isLoading ? "Loading..." : program?.name || "Program Details";
  const [isOpen, setIsOpen] = useState(false);
  const origin = useSyncExternalStore(
    subscribeToNothing,
    getClientOrigin,
    getServerOrigin,
  );

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

  const workshopRegistrationUrl = registrationUrl
    ? appendRegistrationSource(registrationUrl, "workshop_promo")
    : "";
  const workshopRegistrationFallback = appendRegistrationSource(
    registrationFallback,
    "workshop_promo",
  );

  const waGroupUrl = program?.wa_group_link?.trim() ?? "";
  const scheduleDaysLabel = formatScheduleDays(program?.schedule_days);

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">
            Overview of program performance and activity
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1">
          <FinancialVisibilityToggle showLabel />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!program) return;
              programModal.open({ program });
            }}
            disabled={!program}
          >
            <Pencil className="h-4 w-4" />
            Edit Program
          </Button>
        </div>
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
                  Day
                </Typography>
                <Typography variant="body2" tagName="dd">
                  {emptyFallback(scheduleDaysLabel)}
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
            </dl>

            <div className="mt-6 space-y-3 rounded-xl border bg-muted/20 p-4">
              <p className="text-sm font-medium text-foreground">Pricing</p>
              <dl className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Typography
                    variant="caption"
                    tagName="dt"
                    className={PROGRAM_PRICE_TONE_CLASSES.default}
                  >
                    Default
                  </Typography>
                  <Typography
                    variant="body2"
                    tagName="dd"
                    className={cn(
                      "font-medium",
                      PROGRAM_PRICE_TONE_CLASSES.default,
                    )}
                  >
                    {program?.price != null
                      ? formatCurrency(program.price)
                      : "—"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="caption"
                    tagName="dt"
                    className={PROGRAM_PRICE_TONE_CLASSES.individual}
                  >
                    Individual
                  </Typography>
                  <Typography
                    variant="body2"
                    tagName="dd"
                    className={cn(
                      "font-medium",
                      PROGRAM_PRICE_TONE_CLASSES.individual,
                    )}
                  >
                    {program?.promo_individual_price != null
                      ? formatCurrency(program.promo_individual_price)
                      : "—"}
                  </Typography>
                </div>
                <div>
                  <Typography
                    variant="caption"
                    tagName="dt"
                    className={PROGRAM_PRICE_TONE_CLASSES.bareng_teman}
                  >
                    Bareng Teman
                  </Typography>
                  <Typography
                    variant="body2"
                    tagName="dd"
                    className={cn(
                      "font-medium",
                      PROGRAM_PRICE_TONE_CLASSES.bareng_teman,
                    )}
                  >
                    {program?.promo_bareng_teman_price != null
                      ? formatCurrency(program.promo_bareng_teman_price)
                      : "—"}
                  </Typography>
                </div>
              </dl>
            </div>

            <div className="mt-6 grid gap-4 border-t pt-6 sm:grid-cols-3">
              <ParticipantLinkRow
                label="Default Registration Link"
                url={registrationUrl}
                fallback={registrationFallback}
                successMessage="Registration link copied to clipboard"
              />
              <ParticipantLinkRow
                label="Registration Promo Link"
                url={workshopRegistrationUrl}
                fallback={workshopRegistrationFallback}
                successMessage="Promo registration link copied to clipboard"
              />
              <ParticipantLinkRow
                label="WhatsApp Link"
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
