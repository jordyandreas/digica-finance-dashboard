import { BackButton } from "@/components/atoms/back-button";
import { ProgramOverview } from "./_components/program-overview";
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
      <div className="flex flex-col items-start gap-4">
        <BackButton href="/programs" />
        <ProgramOverview programId={id} />
      </div>

      <ProgramSummary programId={id} />

      <ProgramTabs programId={id} />

      {children}
    </div>
  );
}
