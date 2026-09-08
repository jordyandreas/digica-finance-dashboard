"use client";

import { Pencil } from "lucide-react";
import type { ProgramModalProps } from "@/app/(admin)/programs/_modals/add-program";
import { BackButton } from "@/components/atoms/back-button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { FinancialVisibilityToggle } from "@/components/molecules/financial-visibility";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/use-modal";
import { useProgram } from "../_hooks/useProgram";

type ProgramHeaderProps = {
  programId: string;
};

export function ProgramHeader({ programId }: ProgramHeaderProps) {
  const { data: program, isLoading } = useProgram(programId);
  const programModal = useModal<ProgramModalProps>("programModal");
  const title = isLoading ? "Loading..." : program?.name || "Program Details";

  return (
    <div className="flex w-full flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <BackButton href="/programs" />
        <div className="flex shrink-0 items-center gap-1">
          <FinancialVisibilityToggle showLabel />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (!program) return;
              programModal.open({
                program,
                duplicateFrom: null,
                onSuccess: undefined,
              });
            }}
            disabled={!program}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit Program</span>
            <span className="sm:hidden">Edit</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-balance text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {program?.status ? <StatusBadge status={program.status} /> : null}
      </div>
    </div>
  );
}
