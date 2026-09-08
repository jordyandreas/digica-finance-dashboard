import { ProgramHeader } from "./_components/program-header";
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
      <ProgramHeader programId={id} />

      <ProgramTabs programId={id} />

      {children}
    </div>
  );
}
