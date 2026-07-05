import { createAdminClient } from "@/lib/supabase-admin";
import {
  formatProgramDateRange,
  formatProgramTimeRange,
} from "@/utils/program-public";
import {
  resolveProgramIdByIdentifier,
  resolvePublicAppOrigin,
} from "@/utils/program-public-link";

export interface ProgramRegistrationPublicData {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  registration_link: string | null;
  wa_group_link: string | null;
  public_code: string;
  public_slug: string | null;
  summary_html: string | null;
}

export interface ProgramShareMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  dateRange: string;
  timeRange: string;
  programName: string;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength - 1).trim()}…`;
}

export async function getProgramRegistrationPublicData(
  identifier: string,
): Promise<ProgramRegistrationPublicData | null> {
  const supabase = createAdminClient();
  const resolvedProgramId = await resolveProgramIdByIdentifier(
    supabase,
    identifier,
  );

  if (!resolvedProgramId) {
    return null;
  }

  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, name, start_date, end_date, start_time, end_time, registration_link, wa_group_link, public_code, public_slug",
    )
    .eq("id", resolvedProgramId)
    .single();

  if (error || !data) {
    return null;
  }

  const { data: publicContent, error: publicContentError } = await supabase
    .from("program_public_contents")
    .select("summary_html")
    .eq("program_id", resolvedProgramId)
    .maybeSingle();

  if (publicContentError) {
    throw publicContentError;
  }

  return {
    ...data,
    summary_html: publicContent?.summary_html ?? null,
  };
}

export function buildProgramShareMetadata(
  program: ProgramRegistrationPublicData,
  identifier: string,
): ProgramShareMetadata {
  const dateRange = formatProgramDateRange(
    program.start_date,
    program.end_date,
  );
  const timeRange = formatProgramTimeRange(
    program.start_time,
    program.end_time,
  );

  const origin = resolvePublicAppOrigin();
  const normalizedIdentifier = identifier.trim();
  const canonicalUrl = `${origin}/r/${normalizedIdentifier}`;

  const summaryText = program.summary_html
    ? truncate(stripHtml(program.summary_html), 160)
    : "";

  const schedulePart = [dateRange, timeRange].filter(Boolean).join(" · ");
  let description = `Daftar program ${program.name}.`;

  if (schedulePart) {
    description += ` ${schedulePart}.`;
  }

  if (summaryText) {
    const remaining = 200 - description.length - 1;
    if (remaining > 20) {
      description += ` ${truncate(summaryText, remaining)}`;
    }
  }

  return {
    title: program.name,
    description,
    canonicalUrl,
    dateRange,
    timeRange,
    programName: program.name,
  };
}

export async function getProgramRegistrationShareMetadata(
  identifier: string,
): Promise<ProgramShareMetadata | null> {
  const program = await getProgramRegistrationPublicData(identifier);

  if (!program) {
    return null;
  }

  return buildProgramShareMetadata(program, identifier);
}
