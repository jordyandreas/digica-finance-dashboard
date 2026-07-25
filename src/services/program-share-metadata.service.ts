import { createAdminClient } from "@/lib/supabase-admin";
import {
  formatProgramDateRange,
  formatProgramTimeRange,
} from "@/utils/program-public";
import {
  buildShareOgImage,
  buildShareOgLogoUrl,
  type ShareOgImage,
} from "@/utils/program-share-assets";
import {
  resolveProgramIdByIdentifier,
  resolvePublicAppOrigin,
} from "@/utils/program-public-link";
import type { ProgramStatus, ProgramType } from "@/services/programs.service";

export interface ProgramRegistrationPublicData {
  id: string;
  name: string;
  type: ProgramType;
  status: ProgramStatus;
  start_date: string | null;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  registration_link: string | null;
  wa_group_link: string | null;
  public_code: string;
  public_slug: string | null;
  price: number | null;
  promo_individual_price: number | null;
  promo_bareng_teman_price: number | null;
  summary_html: string | null;
  og_image_url: string | null;
  registration_banner_url: string | null;
}

export interface ProgramShareMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  dateRange: string;
  timeRange: string;
  programName: string;
  ogImage: ShareOgImage;
  ogLogoUrl: string;
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
      "id, name, type, status, start_date, end_date, start_time, end_time, registration_link, wa_group_link, public_code, public_slug, price, promo_individual_price, promo_bareng_teman_price",
    )
    .eq("id", resolvedProgramId)
    .single();

  if (error || !data) {
    return null;
  }

  const publicContentResult = await supabase
    .from("program_public_contents")
    .select("summary_html, og_image_url, registration_banner_url")
    .eq("program_id", resolvedProgramId)
    .maybeSingle();

  let summaryHtml: string | null = null;
  let ogImageUrl: string | null = null;
  let registrationBannerUrl: string | null = null;

  if (publicContentResult.error?.code === "42703") {
    const legacyContentResult = await supabase
      .from("program_public_contents")
      .select("summary_html, og_image_url")
      .eq("program_id", resolvedProgramId)
      .maybeSingle();

    if (legacyContentResult.error) {
      throw legacyContentResult.error;
    }

    summaryHtml = legacyContentResult.data?.summary_html ?? null;
    ogImageUrl = legacyContentResult.data?.og_image_url ?? null;
  } else if (publicContentResult.error) {
    throw publicContentResult.error;
  } else {
    summaryHtml = publicContentResult.data?.summary_html ?? null;
    ogImageUrl = publicContentResult.data?.og_image_url ?? null;
    registrationBannerUrl =
      publicContentResult.data?.registration_banner_url ?? null;
  }

  const toNullablePrice = (value: unknown): number | null => {
    if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
      return null;
    }
    return value;
  };

  return {
    ...data,
    status: data.status as ProgramStatus,
    price: toNullablePrice(data.price),
    promo_individual_price: toNullablePrice(data.promo_individual_price),
    promo_bareng_teman_price: toNullablePrice(data.promo_bareng_teman_price),
    summary_html: summaryHtml,
    og_image_url: ogImageUrl,
    registration_banner_url: registrationBannerUrl,
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
  const configuredOgImageUrl =
    program.og_image_url ??
    (normalizedIdentifier === "fw-sql3" ? "/og/fw-sql3.png" : null);

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
    ogImage: buildShareOgImage(origin, program.name, configuredOgImageUrl),
    ogLogoUrl: buildShareOgLogoUrl(origin),
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
