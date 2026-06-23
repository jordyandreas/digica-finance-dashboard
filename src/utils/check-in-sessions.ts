import { getTodayDateString } from "@/lib/date-utils";

export interface CheckInSessionInput {
  id: string;
  session_number: number;
  session_date: string | null;
}

export function normalizeSessionDate(
  date: string | null | undefined,
): string | null {
  if (!date?.trim()) {
    return null;
  }

  return date.split("T")[0];
}

/** Sessions participants may self check-in for (today only). */
export function getPublicCheckInSessions(
  sessions: CheckInSessionInput[],
  today: string = getTodayDateString(),
): CheckInSessionInput[] {
  return sessions.filter(
    (session) => normalizeSessionDate(session.session_date) === today,
  );
}
