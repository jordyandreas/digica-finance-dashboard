"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateProgramInput,
  Program,
  ProgramStatus,
  ProgramType,
  UpdateProgramInput,
} from "@/services/programs.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import type { ProgramModalProps } from "../_modals/add-program";
import { programQueryKey } from "../[id]/_hooks/useProgram";
import { programSessionsQueryKey } from "../[id]/attendance/_hooks/use-attendance";

export type ProgramFormState = {
  name: string;
  type: ProgramType | "";
  year: string;
  start_date: string;
  end_date: string;
  price: number | undefined;
  session_count: string;
  status: ProgramStatus;
};

const optionalString = (value: string) => (value ? value : undefined);

const defaultFormState = (): ProgramFormState => ({
  name: "",
  type: "",
  year: String(new Date().getFullYear()),
  start_date: "",
  end_date: "",
  price: undefined,
  session_count: "0",
  status: "draft",
});

const buildFormState = (program?: Program | null): ProgramFormState => {
  if (!program) {
    return defaultFormState();
  }

  return {
    name: program.name || "",
    type: program.type || "",
    year: program.year != null ? String(program.year) : "",
    start_date: program.start_date ? program.start_date.split("T")[0] : "",
    end_date: program.end_date ? program.end_date.split("T")[0] : "",
    price: program.price ?? undefined,
    session_count: String(program.session_count ?? 0),
    status: program.status || "draft",
  };
};

const parseYear = (value: string) => {
  const year = Number.parseInt(value.trim(), 10);
  return Number.isFinite(year) ? year : undefined;
};

const parseSessionCount = (value: string) => {
  const count = Number.parseInt(value.trim(), 10);
  if (!Number.isFinite(count) || count < 0) {
    return 0;
  }
  return Math.min(count, 52);
};

const buildProgramInput = (
  values: ProgramFormState
): UpdateProgramInput => ({
  name: values.name.trim(),
  type: values.type || undefined,
  year: parseYear(values.year),
  start_date: optionalString(values.start_date),
  end_date: optionalString(values.end_date),
  price: values.price ?? undefined,
  session_count: parseSessionCount(values.session_count),
  status: values.status || undefined,
});

export function useAddProgram({ program, onSuccess }: ProgramModalProps) {
  const queryClient = useQueryClient();
  const { isOpen, close } = useModal<ProgramModalProps>("programModal");
  const [loading, setLoading] = React.useState(false);
  const form = useForm<ProgramFormState>({
    defaultValues: defaultFormState(),
  });
  const name = form.watch("name");
  const year = form.watch("year");

  React.useEffect(() => {
    form.reset(buildFormState(program));
  }, [form, program, isOpen]);

  const handleSubmit = form.handleSubmit(async (values: ProgramFormState) => {
    setLoading(true);
    try {
      const { createProgram, updateProgram } = await import(
        "@/services/programs.service"
      );

      const programData = buildProgramInput(values);
      let result;
      if (program) {
        result = await updateProgram(program.id, programData);
      } else {
        result = await createProgram(programData as CreateProgramInput);
      }

      if (result.error) {
        console.error("Error saving program:", result.error);
        const errorMessage =
          result.error.message || JSON.stringify(result.error);
        toast.error("Error saving program", {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      const savedProgram = result.data;
      if (savedProgram) {
        const { syncProgramSessions } = await import(
          "@/services/program-sessions.service"
        );
        const sessionCount = parseSessionCount(values.session_count);
        const syncResult = await syncProgramSessions(
          savedProgram.id,
          sessionCount,
        );

        if (syncResult.error) {
          console.error("Error syncing program sessions:", syncResult.error);
          toast.error("Program saved but sessions could not be synced", {
            description: syncResult.error.message,
          });
        }

        await queryClient.invalidateQueries({
          queryKey: programQueryKey(savedProgram.id),
        });
        await queryClient.invalidateQueries({
          queryKey: programSessionsQueryKey(savedProgram.id),
        });
      }

      toast.success(
        program
          ? "Program updated successfully"
          : "Program created successfully",
      );
      if (onSuccess) {
        onSuccess();
      }
      close();
    } catch (error) {
      console.error("Error saving program:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error("Error saving program", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  });

  const applyDisabled =
    loading || !name?.trim() || !parseYear(year ?? "");

  return {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  };
}
