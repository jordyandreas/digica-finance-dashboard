'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { StatusBadge } from "@/components/atoms/status-badge";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { formatProgramType } from "@/utils/programs";
import { emptyFallback } from "@/utils/string";
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
              Price
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
              Start Date
            </Typography>
            <Typography variant="body2" tagName="dd">
              {formatDate(program?.start_date ?? null)}
            </Typography>
          </div>
          <div>
            <Typography
              variant="caption"
              tagName="dt"
              className="text-muted-foreground"
            >
              End Date
            </Typography>
            <Typography variant="body2" tagName="dd">
              {formatDate(program?.end_date ?? null)}
            </Typography>
          </div>
          
        </dl>
      </CardContent>
      )}
    </Card>
    </div>
  );
}
