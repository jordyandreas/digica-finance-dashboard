import type { Program } from "@/services/programs.service";
import type { ProgramPublicContent } from "@/services/program-public-content.service";
import type { ProgramSession } from "@/services/program-sessions.service";
import { isBootcampProgram } from "@/utils/programs";

export type ProgramSetupChecklistItemId =
  | "summary"
  | "registration_banner"
  | "promo_banner"
  | "schedule"
  | "default_price"
  | "promo_prices"
  | "wa_group_link"
  | "session_count"
  | "session_dates"
  | "registration_ready"
  | "bootcamp_registration_link";

export type ProgramSetupChecklistItem = {
  id: ProgramSetupChecklistItemId;
  label: string;
  ok: boolean;
  detail: string;
  action: "edit_program" | "attendance" | null;
};

type BuildChecklistInput = {
  program: Program | null | undefined;
  sessions: ProgramSession[];
  publicContent?: ProgramPublicContent | null;
};

function hasMeaningfulHtml(value: string | null | undefined): boolean {
  if (!value?.trim()) {
    return false;
  }
  const text = value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > 0;
}

function hasPositivePrice(value: number | null | undefined): boolean {
  return typeof value === "number" && Number.isFinite(value) && value > 0;
}

export function buildProgramSetupChecklist({
  program,
  sessions,
  publicContent,
}: BuildChecklistInput): ProgramSetupChecklistItem[] {
  if (!program) {
    return [];
  }

  const sessionCount = program.session_count ?? 0;
  const hasSessions = sessionCount > 0;
  const relevantSessions =
    hasSessions && sessions.length > 0
      ? sessions.slice(0, sessionCount)
      : sessions;
  const allDatesSet =
    hasSessions &&
    relevantSessions.length >= sessionCount &&
    relevantSessions
      .slice(0, sessionCount)
      .every((session) => Boolean(session.session_date?.trim()));

  const hasWaGroup = Boolean(program.wa_group_link?.trim());
  const registrationReady = Boolean(program.public_code?.trim());
  const isWorkshop = program.type === "workshop";
  const isBootcamp = isBootcampProgram(program.type);
  const hasBootcampRegLink = Boolean(
    program.bootcamp_registration_link?.trim(),
  );

  const hasSummary = hasMeaningfulHtml(publicContent?.summary_html);
  const hasRegistrationBanner = Boolean(
    publicContent?.registration_banner_url?.trim(),
  );
  const hasPromoBanner = Boolean(publicContent?.promo_banner_url?.trim());

  const missingSchedule: string[] = [];
  if (!program.start_date?.trim()) missingSchedule.push("start date");
  if (!program.end_date?.trim()) missingSchedule.push("end date");
  if (!program.start_time?.trim()) missingSchedule.push("start time");
  if (!program.end_time?.trim()) missingSchedule.push("end time");
  const hasFullSchedule = missingSchedule.length === 0;

  const hasDefaultPrice = hasPositivePrice(program.price);
  const hasPromoIndividual = hasPositivePrice(program.promo_individual_price);
  const hasPromoBarengTeman = hasPositivePrice(
    program.promo_bareng_teman_price,
  );
  const hasPromoPrices = hasPromoIndividual && hasPromoBarengTeman;
  const missingPromoPrices: string[] = [];
  if (!hasPromoIndividual) missingPromoPrices.push("Individual");
  if (!hasPromoBarengTeman) missingPromoPrices.push("Bareng Teman");

  const items: ProgramSetupChecklistItem[] = [
    {
      id: "summary",
      label: "Program benefit / summary",
      ok: hasSummary,
      detail: hasSummary
        ? "Configured for the public registration page"
        : "Add benefits or highlights shown under the program title",
      action: hasSummary ? null : "edit_program",
    },
    {
      id: "registration_banner",
      label: "Registration banner",
      ok: hasRegistrationBanner,
      detail: hasRegistrationBanner
        ? "Configured"
        : "Upload the banner shown on the public registration page",
      action: hasRegistrationBanner ? null : "edit_program",
    },
  ];

  if (isWorkshop) {
    items.push({
      id: "promo_banner",
      label: "Promo banner",
      ok: hasPromoBanner,
      detail: hasPromoBanner
        ? "Configured for workshop check-in"
        : "Upload the banner shown on workshop secure-seat promo",
      action: hasPromoBanner ? null : "edit_program",
    });
  }

  items.push(
    {
      id: "schedule",
      label: "Schedule (dates & times)",
      ok: hasFullSchedule,
      detail: hasFullSchedule
        ? "Start/end date and time are set"
        : `Missing ${missingSchedule.join(", ")}`,
      action: hasFullSchedule ? null : "edit_program",
    },
    {
      id: "default_price",
      label: "Default price",
      ok: hasDefaultPrice,
      detail: hasDefaultPrice
        ? "Configured"
        : "Set the default program price",
      action: hasDefaultPrice ? null : "edit_program",
    },
  );

  if (isBootcamp) {
    items.push({
      id: "promo_prices",
      label: "Workshop promo prices",
      ok: hasPromoPrices,
      detail: hasPromoPrices
        ? "Individual and Bareng Teman are set"
        : `Missing ${missingPromoPrices.join(" & ")}`,
      action: hasPromoPrices ? null : "edit_program",
    });
  }

  items.push(
    {
      id: "wa_group_link",
      label: "WhatsApp group link",
      ok: hasWaGroup,
      detail: hasWaGroup
        ? "Configured"
        : "Not configured — participants won’t get a WA invite after registration",
      action: hasWaGroup ? null : "edit_program",
    },
    {
      id: "session_count",
      label: "Session count",
      ok: hasSessions,
      detail: hasSessions
        ? `${sessionCount} session${sessionCount === 1 ? "" : "s"}`
        : "Set session count so attendance can be tracked",
      action: hasSessions ? null : "edit_program",
    },
    {
      id: "session_dates",
      label: "Session dates",
      ok: allDatesSet,
      detail: !hasSessions
        ? "Set session count first"
        : allDatesSet
          ? "All session dates are set"
          : "Some session dates are still empty",
      action: !hasSessions || allDatesSet ? null : "attendance",
    },
    {
      id: "registration_ready",
      label: "Registration link",
      ok: registrationReady,
      detail: registrationReady
        ? "Public registration link is ready"
        : "Public code missing — recreate or edit the program",
      action: registrationReady ? null : "edit_program",
    },
  );

  if (isWorkshop) {
    items.push({
      id: "bootcamp_registration_link",
      label: "Bootcamp registration link",
      ok: hasBootcampRegLink,
      detail: hasBootcampRegLink
        ? "Configured for secure-seat follow-up"
        : "Recommended for workshop secure-seat Yes follow-up",
      action: hasBootcampRegLink ? null : "edit_program",
    });
  }

  return items;
}
