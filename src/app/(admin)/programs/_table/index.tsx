"use client";

import { DataTable } from "@/components/molecules/data-table";
import { Program } from "@/services/programs.service";
import { programsColumns } from "./columns";

interface ProgramsTableProps {
  data: Program[];
  onEdit?: (program: Program) => void;
  onDelete?: (program: Program) => void;
}

export function ProgramsTable({ data, onEdit, onDelete }: ProgramsTableProps) {
  const columns = programsColumns({ onEdit, onDelete });
  
  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(program) => program.id}
    />
  );
}