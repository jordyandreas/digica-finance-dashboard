import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getTodayDateString } from "@/lib/date-utils";
import { isSecureSeatInterest } from "@/constants/secure-seat-interest";
import type { ProgramType } from "@/services/programs.service";
import { getPublicCheckInSessions } from "@/utils/check-in-sessions";
import { resolveProgramIdByIdentifier } from "@/utils/program-public-link";
import { fetchAllPages } from "@/utils/supabase-fetch-all";
import type { SupabaseClient } from "@supabase/supabase-js";

interface CheckInRouteParams {
  params: Promise<{ programId: string }>;
}

type SecureSeatTargetType = Extract<
  ProgramType,
  "mini_bootcamp" | "bootcamp"
>;

function extractProgramIdentifierFromUrl(url: string): string | null {
  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const hasOrigin = /^https?:\/\//i.test(trimmed);
    const parsed = hasOrigin
      ? new URL(trimmed)
      : new URL(trimmed, "https://placeholder.local");
    const match = parsed.pathname.match(
      /\/(?:r|registration|c|check-in)\/([^/]+)/i,
    );
    if (!match?.[1]) {
      return null;
    }
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

async function resolveSecureSeatTargetType(
  supabase: SupabaseClient,
  bootcampRegistrationLink: string | null,
): Promise<SecureSeatTargetType | null> {
  if (!bootcampRegistrationLink?.trim()) {
    return null;
  }

  const identifier = extractProgramIdentifierFromUrl(bootcampRegistrationLink);
  if (!identifier) {
    return null;
  }

  const linkedProgramId = await resolveProgramIdByIdentifier(
    supabase,
    identifier,
  );
  if (!linkedProgramId) {
    return null;
  }

  const { data, error } = await supabase
    .from("programs")
    .select("type")
    .eq("id", linkedProgramId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const type = data?.type;
  if (type === "mini_bootcamp" || type === "bootcamp") {
    return type;
  }

  return null;
}

async function loadProgramContext(programId: string) {
  const supabase = createAdminClient();

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select(
      "id, name, type, batch, session_count, registration_link, bootcamp_registration_link, public_code, public_slug",
    )
    .eq("id", programId)
    .single();

  if (programError || !program) {
    return null;
  }

  const { data: participants, error: participantsError } = await fetchAllPages(
    (from, to) =>
      supabase
        .from("participants")
        .select("id, name, email, phone")
        .eq("program_id", programId)
        .order("name", { ascending: true })
        .range(from, to),
  );

  if (participantsError) {
    throw participantsError;
  }

  const { data: sessions, error: sessionsError } = await supabase
    .from("program_sessions")
    .select("id, session_number, session_date")
    .eq("program_id", programId)
    .order("session_number", { ascending: true });

  if (sessionsError) {
    throw sessionsError;
  }

  const { data: publicContent } = await supabase
    .from("program_public_contents")
    .select("promo_banner_url")
    .eq("program_id", programId)
    .maybeSingle();

  const secureSeatTargetType =
    (program.type as ProgramType) === "workshop"
      ? await resolveSecureSeatTargetType(
          supabase,
          (program.bootcamp_registration_link as string | null) ?? null,
        )
      : null;

  return {
    program: {
      id: program.id as string,
      name: program.name as string,
      type: program.type as ProgramType,
      batch: (() => {
        const raw = program.batch;
        if (typeof raw === "number" && Number.isFinite(raw) && raw >= 1) {
          return raw;
        }
        if (raw == null) {
          return null;
        }
        const parsed = Number(raw);
        return Number.isFinite(parsed) && parsed >= 1 ? parsed : null;
      })(),
      session_count: program.session_count as number,
      registration_link: (program.registration_link as string | null) ?? null,
      bootcamp_registration_link:
        (program.bootcamp_registration_link as string | null) ?? null,
      public_code: (program.public_code as string | null) ?? null,
      public_slug: (program.public_slug as string | null) ?? null,
      promo_banner_url:
        (publicContent?.promo_banner_url as string | null) ?? null,
      secure_seat_target_type: secureSeatTargetType,
    },
    participants,
    sessions: sessions ?? [],
  };
}

export async function GET(_request: Request, { params }: CheckInRouteParams) {
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

    const context = await loadProgramContext(resolvedProgramId);

    if (!context) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    if (context.program.session_count <= 0) {
      return NextResponse.json(
        { error: "This program has no sessions configured" },
        { status: 404 },
      );
    }

    const today = getTodayDateString();
    const checkInSessions = getPublicCheckInSessions(context.sessions, today);

    return NextResponse.json({
      program: {
        id: context.program.id,
        name: context.program.name,
        type: context.program.type,
        batch: context.program.batch,
        registration_link: context.program.registration_link,
        bootcamp_registration_link: context.program.bootcamp_registration_link,
        public_code: context.program.public_code,
        public_slug: context.program.public_slug,
        promo_banner_url: context.program.promo_banner_url,
        secure_seat_target_type: context.program.secure_seat_target_type,
      },
      participants: context.participants.map((participant) => ({
        id: participant.id,
        name: participant.name,
        email: participant.email,
        phone: participant.phone,
      })),
      sessions: checkInSessions.map((session) => ({
        id: session.id,
        session_number: session.session_number,
        session_date: session.session_date,
      })),
    });
  } catch (error) {
    console.error("Check-in GET error:", error);
    return NextResponse.json(
      { error: "Failed to load check-in data" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: CheckInRouteParams) {
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

    const body = (await request.json()) as {
      participant_id?: string;
      session_id?: string;
      secure_seat_interest?: string;
    };

    const participantId = body.participant_id?.trim();
    const sessionId = body.session_id?.trim();
    const secureSeatInterest = body.secure_seat_interest?.trim();

    if (!participantId || !sessionId) {
      return NextResponse.json(
        { error: "participant_id and session_id are required" },
        { status: 400 },
      );
    }

    const context = await loadProgramContext(resolvedProgramId);

    if (!context) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
    }

    const isWorkshop = context.program.type === "workshop";

    if (isWorkshop) {
      if (!isSecureSeatInterest(secureSeatInterest)) {
        return NextResponse.json(
          {
            error:
              "secure_seat_interest is required and must be yes, undecided, or no",
          },
          { status: 400 },
        );
      }
    }

    const participant = context.participants.find(
      (item) => item.id === participantId,
    );

    if (!participant) {
      return NextResponse.json(
        { error: "Participant not found for this program" },
        { status: 400 },
      );
    }

    const today = getTodayDateString();
    const checkInSessions = getPublicCheckInSessions(context.sessions, today);

    const session = checkInSessions.find((item) => item.id === sessionId);

    if (!session) {
      return NextResponse.json(
        { error: "Check-in is only available for today's session" },
        { status: 400 },
      );
    }

    const { error } = await supabase.from("attendance").upsert(
      {
        participant_id: participantId,
        session_id: sessionId,
        status: "present",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "participant_id,session_id" },
    );

    if (error) {
      throw error;
    }

    if (isWorkshop && isSecureSeatInterest(secureSeatInterest)) {
      const { error: interestError } = await supabase
        .from("participants")
        .update({ secure_seat_interest: secureSeatInterest })
        .eq("id", participantId)
        .eq("program_id", resolvedProgramId);

      if (interestError) {
        throw interestError;
      }
    }

    return NextResponse.json({
      success: true,
      session_number: session.session_number,
    });
  } catch (error) {
    console.error("Check-in POST error:", error);
    return NextResponse.json(
      { error: "Failed to submit check-in" },
      { status: 500 },
    );
  }
}
