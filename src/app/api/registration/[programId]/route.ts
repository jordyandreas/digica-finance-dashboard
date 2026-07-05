import { NextResponse } from "next/server";
import { getTodayDateString } from "@/lib/date-utils";
import { createAdminClient } from "@/lib/supabase-admin";
import {
  participantRegistrationSchema,
} from "@/schemas/participant-registration-schema";
import { normalizeParticipantPhoneForSubmit } from "@/utils/phone";
import { resolveProgramIdByIdentifier } from "@/utils/program-public-link";

interface RegistrationRouteParams {
  params: Promise<{ programId: string }>;
}

async function getProgram(programId: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("programs")
    .select(
      "id, name, start_date, end_date, start_time, end_time, registration_link, wa_group_link, public_code, public_slug",
    )
    .eq("id", programId)
    .single();

  if (error || !data) {
    return null;
  }

  const { data: publicContent, error: publicContentError } = await supabase
    .from("program_public_contents")
    .select("summary_html")
    .eq("program_id", programId)
    .maybeSingle();

  if (publicContentError) {
    throw publicContentError;
  }

  return {
    ...data,
    summary_html: publicContent?.summary_html ?? null,
  };
}

export async function GET(
  _request: Request,
  { params }: RegistrationRouteParams,
) {
  try {
    const { programId: identifier } = await params;
    const supabase = createAdminClient();
    const resolvedProgramId = await resolveProgramIdByIdentifier(
      supabase,
      identifier,
    );

    if (!resolvedProgramId) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = await getProgram(resolvedProgramId);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    return NextResponse.json({ program });
  } catch (error) {
    console.error("Registration GET error:", error);
    return NextResponse.json(
      { error: "Failed to load registration data" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: RegistrationRouteParams,
) {
  try {
    const { programId: identifier } = await params;
    const supabase = createAdminClient();
    const resolvedProgramId = await resolveProgramIdByIdentifier(
      supabase,
      identifier,
    );

    if (!resolvedProgramId) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const program = await getProgram(resolvedProgramId);

    if (!program) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = participantRegistrationSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json(
        { error: firstIssue?.message || "Invalid registration payload" },
        { status: 400 },
      );
    }

    const values = validation.data;
    const { error } = await supabase.from("participants").insert({
      name: values.name.trim().toLowerCase(),
      email: values.email.trim().toLowerCase(),
      phone: normalizeParticipantPhoneForSubmit(values.phone),
      occupation: values.occupation || null,
      organization: values.organization?.trim().toLowerCase() || null,
      program_id: resolvedProgramId,
      status: "active",
      joined_date: getTodayDateString(),
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit registration" },
      { status: 500 },
    );
  }
}
