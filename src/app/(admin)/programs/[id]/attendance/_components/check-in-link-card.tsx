"use client";

import * as React from "react";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCheckInUrl,
  resolvePublicIdentifier,
  type ProgramPublicLinkFields,
} from "@/utils/program-public-link";
import { ParticipantLinkRow } from "../../_components/participant-link-row";

interface CheckInLinkCardProps {
  program: ProgramPublicLinkFields | null | undefined;
}

export function CheckInLinkCard({ program }: CheckInLinkCardProps) {
  const [checkInUrl, setCheckInUrl] = React.useState("");

  React.useEffect(() => {
    if (!program?.public_code) {
      setCheckInUrl("");
      return;
    }

    setCheckInUrl(buildCheckInUrl(window.location.origin, program));
  }, [program]);

  const fallback = program?.public_code
    ? `/c/${resolvePublicIdentifier(program)}`
    : "";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Check-in Link</CardTitle>
        <Typography variant="caption" className="text-muted-foreground">
          Use on class day after session dates are set.
        </Typography>
      </CardHeader>
      <CardContent>
        <ParticipantLinkRow
          label="Check-in link"
          url={checkInUrl}
          fallback={fallback}
          successMessage="Check-in link copied to clipboard"
        />
      </CardContent>
    </Card>
  );
}
