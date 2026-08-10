"use client";

import * as React from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  CreateProgramInput,
  Program,
  ProgramStatus,
  ProgramType,
  ScheduleDay,
  UpdateProgramInput,
} from "@/services/programs.service";
import { useModal } from "@/hooks/use-modal";
import { useForm } from "react-hook-form";
import type { ProgramModalProps } from "../_modals/add-program";
import { programQueryKey } from "../[id]/_hooks/useProgram";
import { programSessionsQueryKey } from "../[id]/attendance/_hooks/use-attendance";
import { programPublicSlugSchema } from "@/schemas/program-public-slug-schema";
import { normalizeScheduleDays } from "@/utils/programs";

export type ProgramFormState = {
  name: string;
  summary_html: string;
  og_image_url: string;
  registration_banner_url: string;
  promo_banner_url: string;
  type: ProgramType | "";
  year: string;
  batch: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  schedule_days: ScheduleDay[];
  registration_link: string;
  bootcamp_registration_link: string;
  wa_group_link: string;
  public_slug: string;
  price: number | undefined;
  promo_individual_price: number | undefined;
  promo_bareng_teman_price: number | undefined;
  session_count: string;
  status: ProgramStatus;
};

const nullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const defaultFormState = (): ProgramFormState => ({
  name: "",
  summary_html: "",
  og_image_url: "",
  registration_banner_url: "",
  promo_banner_url: "",
  type: "",
  year: String(new Date().getFullYear()),
  batch: "",
  start_date: "",
  end_date: "",
  start_time: "",
  end_time: "",
  schedule_days: [],
  registration_link: "",
  bootcamp_registration_link: "",
  wa_group_link: "",
  public_slug: "",
  price: undefined,
  promo_individual_price: undefined,
  promo_bareng_teman_price: undefined,
  session_count: "0",
  status: "draft",
});

const buildFormState = (program?: Program | null): ProgramFormState => {
  if (!program) {
    return defaultFormState();
  }

  return {
    name: program.name || "",
    summary_html: "",
    og_image_url: "",
    registration_banner_url: "",
    promo_banner_url: "",
    type: program.type || "",
    year: program.year != null ? String(program.year) : "",
    batch: program.batch != null ? String(program.batch) : "",
    start_date: program.start_date ? program.start_date.split("T")[0] : "",
    end_date: program.end_date ? program.end_date.split("T")[0] : "",
    start_time: program.start_time ?? "",
    end_time: program.end_time ?? "",
    schedule_days: normalizeScheduleDays(program.schedule_days),
    registration_link: program.registration_link ?? "",
    bootcamp_registration_link: program.bootcamp_registration_link ?? "",
    wa_group_link: program.wa_group_link ?? "",
    public_slug: program.public_slug ?? "",
    price: program.price ?? undefined,
    promo_individual_price: program.promo_individual_price ?? undefined,
    promo_bareng_teman_price: program.promo_bareng_teman_price ?? undefined,
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

const parseBatch = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const batch = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(batch) || batch < 1) {
    return null;
  }
  return batch;
};

const parseOfferPrice = (value: number | undefined): number | null => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.round(value);
};

const buildProgramInput = (
  values: ProgramFormState
): UpdateProgramInput => {
  const isPaidProgram =
    values.type === "bootcamp" || values.type === "mini_bootcamp";

  return {
    name: values.name.trim(),
    type: values.type || undefined,
    year: parseYear(values.year),
    batch: parseBatch(values.batch),
    start_date: nullableString(values.start_date),
    end_date: nullableString(values.end_date),
    start_time: nullableString(values.start_time),
    end_time: nullableString(values.end_time),
    schedule_days: normalizeScheduleDays(values.schedule_days),
    registration_link: nullableString(values.registration_link),
    bootcamp_registration_link: nullableString(values.bootcamp_registration_link),
    wa_group_link: nullableString(values.wa_group_link),
    public_slug: nullableString(values.public_slug),
    price: values.price ?? undefined,
    promo_individual_price: isPaidProgram
      ? parseOfferPrice(values.promo_individual_price)
      : null,
    promo_bareng_teman_price: isPaidProgram
      ? parseOfferPrice(values.promo_bareng_teman_price)
      : null,
    session_count: parseSessionCount(values.session_count),
    status: values.status || undefined,
  };
};

export function useAddProgram({ program, onSuccess }: ProgramModalProps) {
  const queryClient = useQueryClient();
  const { isOpen, close } = useModal<ProgramModalProps>("programModal");
  const [loading, setLoading] = React.useState(false);
  const [registrationBannerFile, setRegistrationBannerFile] =
    React.useState<File | null>(null);
  const [promoBannerFile, setPromoBannerFile] = React.useState<File | null>(
    null,
  );
  const form = useForm<ProgramFormState>({
    defaultValues: defaultFormState(),
  });
  const name = form.watch("name");
  const year = form.watch("year");
  const programType = form.watch("type");

  React.useEffect(() => {
    form.reset(buildFormState(program));
    setRegistrationBannerFile(null);
    setPromoBannerFile(null);
  }, [form, program, isOpen]);

  React.useEffect(() => {
    if (!isOpen || !program?.id) {
      form.setValue("summary_html", "", { shouldDirty: false });
      form.setValue("og_image_url", "", { shouldDirty: false });
      form.setValue("registration_banner_url", "", { shouldDirty: false });
      form.setValue("promo_banner_url", "", { shouldDirty: false });
      return;
    }

    let cancelled = false;

    void (async () => {
      const { getProgramPublicContent } = await import(
        "@/services/program-public-content.service"
      );
      const result = await getProgramPublicContent(program.id);

      if (!cancelled) {
        form.setValue("summary_html", result.data?.summary_html ?? "", {
          shouldDirty: false,
        });
        form.setValue("og_image_url", result.data?.og_image_url ?? "", {
          shouldDirty: false,
        });
        form.setValue(
          "registration_banner_url",
          result.data?.registration_banner_url ?? "",
          { shouldDirty: false },
        );
        form.setValue("promo_banner_url", result.data?.promo_banner_url ?? "", {
          shouldDirty: false,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [form, isOpen, program?.id]);

  const handleSubmit = form.handleSubmit(async (values: ProgramFormState) => {
    const slugValidation = programPublicSlugSchema.safeParse(values.public_slug);
    if (!slugValidation.success) {
      const message =
        slugValidation.error.issues[0]?.message ||
        "Custom link slug is invalid";
      form.setError("public_slug", { type: "manual", message });
      toast.error(message);
      return;
    }

    setLoading(true);
    try {
      const { createProgram, updateProgram } = await import(
        "@/services/programs.service"
      );

      const programData = buildProgramInput(values);
      if (values.type !== "workshop") {
        programData.bootcamp_registration_link = null;
      }

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

        if (result.error.code === "23505") {
          form.setError("public_slug", {
            type: "manual",
            message: "This custom link slug is already in use",
          });
        }

        toast.error("Error saving program", {
          description: errorMessage,
        });
        throw new Error(errorMessage);
      }

      const savedProgram = result.data;
      if (savedProgram) {
        const { upsertProgramPublicContent } = await import(
          "@/services/program-public-content.service"
        );
        const { syncProgramSessions } = await import(
          "@/services/program-sessions.service"
        );
        const {
          removeProgramBannerObjects,
          uploadProgramBanner,
        } = await import("@/services/program-banner-storage.service");

        let registrationBannerUrl = nullableString(
          values.registration_banner_url,
        );
        let promoBannerUrl =
          values.type === "workshop"
            ? nullableString(values.promo_banner_url)
            : null;

        if (registrationBannerFile) {
          const uploadResult = await uploadProgramBanner(
            savedProgram.id,
            "registration",
            registrationBannerFile,
          );
          if (uploadResult.error || !uploadResult.url) {
            throw uploadResult.error ?? new Error("Failed to upload registration banner");
          }
          registrationBannerUrl = uploadResult.url;
        } else if (!registrationBannerUrl) {
          await removeProgramBannerObjects(savedProgram.id, "registration");
        }

        if (values.type === "workshop" && promoBannerFile) {
          const uploadResult = await uploadProgramBanner(
            savedProgram.id,
            "promo",
            promoBannerFile,
          );
          if (uploadResult.error || !uploadResult.url) {
            throw uploadResult.error ?? new Error("Failed to upload promo banner");
          }
          promoBannerUrl = uploadResult.url;
        } else if (values.type !== "workshop" || !promoBannerUrl) {
          await removeProgramBannerObjects(savedProgram.id, "promo");
          promoBannerUrl = null;
        }

        const contentResult = await upsertProgramPublicContent({
          program_id: savedProgram.id,
          summary_html: values.summary_html.trim() || null,
          og_image_url: nullableString(values.og_image_url),
          registration_banner_url: registrationBannerUrl,
          promo_banner_url: promoBannerUrl,
        });

        if (contentResult.error) {
          console.error(
            "Error saving program public content:",
            contentResult.error,
          );
          toast.error("Program saved but summary content could not be updated", {
            description: contentResult.error.message,
          });
        }

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
        await queryClient.invalidateQueries({
          queryKey: ["programs"],
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
    programType,
    registrationBannerFile,
    setRegistrationBannerFile,
    promoBannerFile,
    setPromoBannerFile,
  };
}
