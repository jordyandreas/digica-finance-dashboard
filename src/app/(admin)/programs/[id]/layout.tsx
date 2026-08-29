import { BackButton } from "@/components/atoms/back-button";
import { ProgramOverview } from "./_components/program-overview";
import { ProgramParticipantOverview } from "./_components/program-participant-overview";
import { ProgramSummary } from "./_components/program-summary";
import { ProgramTabs } from "./_components/program-tabs";

export default async function ProgramLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-8">
      <div className="flex w-full flex-col items-start gap-4">
        <BackButton href="/programs" />
        <ProgramOverview programId={id} />
        <ProgramParticipantOverview programId={id} />
      </div>

      <ProgramSummary programId={id} />

      <ProgramTabs programId={id} />

      {children}
    </div>
  );
}
