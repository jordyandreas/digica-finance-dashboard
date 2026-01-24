"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePrograms } from "./_hooks/use-programs";
import { ProgramsPageContent } from "./_components/programs-content";

export default function ProgramsPage() {
  const { data: programs, error, isLoading } = usePrograms();

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">
            Manage your programs and initiatives
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Loading programs...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Fetching programs from Supabase.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">
            Manage your programs and initiatives
          </p>
        </div>
        <Card className="border-destructive/50 bg-destructive/10">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error loading programs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
            <p className="mt-2 text-xs">
              Please ensure your Supabase &quot;programs&quot; table exists and
              has the correct schema.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProgramsPageContent programs={programs || []} />;
}
