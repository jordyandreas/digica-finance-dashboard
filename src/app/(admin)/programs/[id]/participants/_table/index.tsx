"use client";

import { DataTable } from "@/components/molecules/data-table";
import { Participant } from "@/services/participants.service";
import type { ProgramType } from "@/services/programs.service";
import { participantsColumns } from "./columns";

interface ParticipantsTableProps {
  data: Participant[];
  programType?: ProgramType | null;
  onAddPayment?: (participant: Participant) => void;
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
}

export function ParticipantsTable({
  data,
  programType,
  onAddPayment,
  onEdit,
  onDelete,
}: ParticipantsTableProps) {
  const columns = participantsColumns({
    programType,
    onAddPayment,
    onEdit,
    onDelete,
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(participant) => participant.id}
    />
  );
}