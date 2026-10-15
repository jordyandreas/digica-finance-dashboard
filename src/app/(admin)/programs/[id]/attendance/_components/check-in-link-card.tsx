"use client";

import * as React from "react";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  buildCheckInUrl,
  buildRecordingCheckInUrl,
  resolvePublicAppOrigin,
  resolvePublicIdentifier,
  type ProgramPublicLinkFields,
} from "@/utils/program-public-link";
import { ParticipantLinkRow } from "../../_components/participant-link-row";

interface CheckInLinkCardProps {
  program: ProgramPublicLinkFields | null | undefined;
  showRecordingCheckIn?: boolean;
}

export function CheckInLinkCard({
  program,
  showRecordingCheckIn = false,
}: CheckInLinkCardProps) {
  const [checkInUrl, setCheckInUrl] = React.useState("");
  const [recordingCheckInUrl, setRecordingCheckInUrl] = React.useState("");

  React.useEffect(() => {
    if (!program?.public_code) {
      setCheckInUrl("");
      setRecordingCheckInUrl("");
      return;
    }

    const origin = resolvePublicAppOrigin(window.location.origin);
    setCheckInUrl(buildCheckInUrl(origin, program));
    setRecordingCheckInUrl(
      showRecordingCheckIn ? buildRecordingCheckInUrl(origin, program) : "",
    );
  }, [program, showRecordingCheckIn]);

  const identifier = program?.public_code
    ? resolvePublicIdentifier(program)
    : "";
  const fallback = identifier ? `/c/${identifier}` : "";
  const recordingFallback = identifier ? `/c/${identifier}/recording` : "";

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>
          {showRecordingCheckIn ? "Check-in Links" : "Check-in Link"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-1.5">
          <ParticipantLinkRow
            label="Check-in link"
            url={checkInUrl}
            fallback={fallback}
            successMessage="Check-in link copied to clipboard"
          />
          <Typography variant="caption" className="text-muted-foreground">
            Use on class day after session dates are set.
          </Typography>
        </div>
        {showRecordingCheckIn ? (
          <div className="space-y-1.5">
            <ParticipantLinkRow
              label="Recording check-in"
              url={recordingCheckInUrl}
              fallback={recordingFallback}
              successMessage="Recording check-in link copied to clipboard"
            />
            <Typography variant="caption" className="text-muted-foreground">
              Can be submitted any day after watching the recording for the
              selected session.
            </Typography>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
