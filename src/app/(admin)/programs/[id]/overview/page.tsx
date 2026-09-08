"use client";

import { useParams } from "next/navigation";
import { ProgramExpenseByCategory } from "../_components/program-expense-by-category";
import { ProgramOverview } from "../_components/program-overview";
import { ProgramParticipantOverview } from "../_components/program-participant-overview";
import { ProgramSetupChecklist } from "../_components/program-setup-checklist";
import { ProgramSummary } from "../_components/program-summary";
import { TenorFollowUpAlert } from "../payments/_components/tenor-follow-up-alert";

export default function ProgramOverviewPage() {
  const { id } = useParams<{ id?: string }>();
  const programId = Array.isArray(id) ? id[0] : (id ?? "");

  if (!programId) {
    return null;
  }

  return (
    <div className="space-y-6">
      <ProgramSummary programId={programId} />
      <ProgramOverview programId={programId} />
      <ProgramSetupChecklist programId={programId} />
      <ProgramParticipantOverview programId={programId} />
      <TenorFollowUpAlert programId={programId} />
      <ProgramExpenseByCategory programId={programId} />
    </div>
  );
}
