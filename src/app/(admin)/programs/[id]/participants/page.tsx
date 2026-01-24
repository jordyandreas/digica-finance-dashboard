"use client";

import { useParams } from "next/navigation";
import { useParticipants } from "./_hooks/use-participants";
import { ParticipantsContent } from "./_components/participants-content";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ParticipantsPage() {
  const { id } = useParams<{ id: string }>();
  const programId = id ?? "";
  const {
    data: participants,
    error,
    isLoading,
  } = useParticipants(programId);

  return (
    <div className="space-y-8">
       {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Loading participants...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching participants from Supabase.
            </p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error loading participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <p className="mt-2 text-xs">
              Please ensure your Supabase &quot;participants&quot; table exists
              and has the correct schema.
            </p>
          </CardContent>
        </Card>
      )}

      {!error && !isLoading && (
        <ParticipantsContent
          participants={participants || []}
          programId={programId}
        />
      )}
    </div>
  );
}