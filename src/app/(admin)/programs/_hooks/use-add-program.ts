"use client";

import * as React from "react";
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

export type ProgramFormState = {
  name: string;
  type: ProgramType | "";
  start_date: string;
  end_date: string;
  price: number | undefined;
  status: ProgramStatus;
};

const optionalString = (value: string) => (value ? value : undefined);

const defaultFormState = (): ProgramFormState => ({
  name: "",
  type: "",
  start_date: "",
  end_date: "",
  price: undefined,
  status: "draft",
});

const buildFormState = (program?: Program | null): ProgramFormState => {
  if (!program) {
    return defaultFormState();
  }

  return {
    name: program.name || "",
    type: program.type || "",
    start_date: program.start_date ? program.start_date.split("T")[0] : "",
    end_date: program.end_date ? program.end_date.split("T")[0] : "",
    price: program.price ?? undefined,
    status: program.status || "draft",
  };
};

const buildProgramInput = (
  values: ProgramFormState
): UpdateProgramInput => ({
  name: values.name.trim(),
  type: values.type || undefined,
  start_date: optionalString(values.start_date),
  end_date: optionalString(values.end_date),
  price: values.price ?? undefined,
  status: values.status || undefined,
});

export function useAddProgram({ program, onSuccess }: ProgramModalProps) {
  const { isOpen, close } = useModal<ProgramModalProps>("programModal");
  const [loading, setLoading] = React.useState(false);
  const form = useForm<ProgramFormState>({
    defaultValues: defaultFormState(),
  });
  const name = form.watch("name");

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

  const applyDisabled = loading || !name?.trim();

  return {
    isOpen,
    close,
    form,
    handleSubmit,
    applyDisabled,
  };
}
