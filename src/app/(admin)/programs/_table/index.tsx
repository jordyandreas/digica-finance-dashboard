"use client";

import { useRouter } from "next/navigation";
import { DataTable } from "@/components/molecules/data-table";
import { ProgramListItem } from "@/services/programs.service";
import { programsColumns } from "./columns";

interface ProgramsTableProps {
  data: ProgramListItem[];
  onEdit?: (program: ProgramListItem) => void;
  onDelete?: (program: ProgramListItem) => void;
}

function getProgramDetailPath(program: ProgramListItem): string | null {
  const programId =
    program.id ??
    (program as { program_id?: string }).program_id ??
    (program as { uuid?: string }).uuid;
  const normalizedProgramId =
    programId != null ? String(programId).trim() : "";
  const isValidProgramId =
    Boolean(normalizedProgramId) &&
    normalizedProgramId !== "undefined" &&
    normalizedProgramId !== "null";

  if (!isValidProgramId) return null;
  return `/programs/${normalizedProgramId}/participants`;
}

export function ProgramsTable({ data, onEdit, onDelete }: ProgramsTableProps) {
  const router = useRouter();
  const columns = programsColumns({ onEdit, onDelete });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(program) => program.id}
      onRowClick={(program) => {
        const path = getProgramDetailPath(program);
        if (path) router.push(path);
      }}
    />
  );
}
