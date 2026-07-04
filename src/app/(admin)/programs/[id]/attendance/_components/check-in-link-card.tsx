"use client";

import * as React from "react";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ParticipantLinkRow } from "../../_components/participant-link-row";

interface CheckInLinkCardProps {
  programId: string;
}

export function CheckInLinkCard({ programId }: CheckInLinkCardProps) {
  const [checkInUrl, setCheckInUrl] = React.useState("");

  React.useEffect(() => {
    setCheckInUrl(`${window.location.origin}/check-in/${programId}`);
  }, [programId]);

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
          fallback={`/check-in/${programId}`}
          successMessage="Check-in link copied to clipboard"
        />
      </CardContent>
    </Card>
  );
}
