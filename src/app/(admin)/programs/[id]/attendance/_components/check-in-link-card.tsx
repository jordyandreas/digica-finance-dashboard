"use client";

import * as React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CheckInLinkCardProps {
  programId: string;
}

export function CheckInLinkCard({ programId }: CheckInLinkCardProps) {
  const [checkInUrl, setCheckInUrl] = React.useState("");

  React.useEffect(() => {
    setCheckInUrl(`${window.location.origin}/check-in/${programId}`);
  }, [programId]);

  const handleCopy = async () => {
    if (!checkInUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(checkInUrl);
      toast.success("Check-in link copied to clipboard");
    } catch {
      toast.error("Failed to copy check-in link");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle>Participant Check-in Link</CardTitle>
        <Typography variant="caption" className="text-muted-foreground">
          Share this link on class day. Participants can only check in for
          today&apos;s session — set session dates on this page first.
        </Typography>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <p className="min-w-0 flex-1 break-all rounded-md border bg-muted/40 px-3 py-2 text-sm">
          {checkInUrl || `/check-in/${programId}`}
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={!checkInUrl}
        >
          <Copy className="h-4 w-4" />
          Copy link
        </Button>
      </CardContent>
    </Card>
  );
}
