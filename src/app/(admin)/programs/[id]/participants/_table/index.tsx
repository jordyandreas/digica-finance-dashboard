"use client";

import { DataTable } from "@/components/molecules/data-table";
import { Participant } from "@/services/participants.service";
import { participantsColumns } from "./columns";

interface ParticipantsTableProps {
  data: Participant[];
  onEdit?: (participant: Participant) => void;
  onDelete?: (participant: Participant) => void;
}

export function ParticipantsTable({
  data,
  onEdit,
  onDelete,
}: ParticipantsTableProps) {
  const columns = participantsColumns({ onEdit, onDelete });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(participant) => participant.id}
    />
  );
}