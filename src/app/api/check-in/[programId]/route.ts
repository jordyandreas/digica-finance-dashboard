import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getTodayDateString } from "@/lib/date-utils";
import { getPublicCheckInSessions } from "@/utils/check-in-sessions";

interface CheckInRouteParams {
  params: Promise<{ programId: string }>;
}

async function loadProgramContext(programId: string) {
  const supabase = createAdminClient();

  const { data: program, error: programError } = await supabase
    .from("programs")
    .select("id, name, session_count")
    .eq("id", programId)
    .single();

  if (programError || !program) {
    return null;
  }

  const { data: participants, error: participantsError } = await supabase
    .from("participants")
    .select("id, name, email, phone")
    .eq("program_id", programId)
    .order("name", { ascending: true });

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

  return {
    program,
    participants: participants ?? [],
    sessions: sessions ?? [],
  };
}

export async function GET(_request: Request, { params }: CheckInRouteParams) {
  try {
    const { programId } = await params;
    const context = await loadProgramContext(programId);

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
    const { programId } = await params;
    const body = (await request.json()) as {
      participant_id?: string;
      session_id?: string;
    };

    const participantId = body.participant_id?.trim();
    const sessionId = body.session_id?.trim();

    if (!participantId || !sessionId) {
      return NextResponse.json(
        { error: "participant_id and session_id are required" },
        { status: 400 },
      );
    }

    const context = await loadProgramContext(programId);

    if (!context) {
      return NextResponse.json({ error: "Program not found" }, { status: 404 });
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

    const supabase = createAdminClient();
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
