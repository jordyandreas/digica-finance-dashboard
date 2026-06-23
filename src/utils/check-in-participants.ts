export interface CheckInParticipantInput {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
}

export function formatCheckInParticipantLabel(
  participant: CheckInParticipantInput,
  duplicateNames: Set<string>,
): string {
  const name = participant.name?.trim() || "Unnamed participant";

  if (!duplicateNames.has(name.toLowerCase())) {
    return name;
  }

  if (participant.email?.trim()) {
    return `${name} (${participant.email.trim()})`;
  }

  if (participant.phone?.trim()) {
    return `${name} (${participant.phone.trim()})`;
  }

  return `${name} (${participant.id.slice(0, 8)})`;
}

export function getDuplicateParticipantNames(
  participants: CheckInParticipantInput[],
): Set<string> {
  const counts = new Map<string, number>();

  for (const participant of participants) {
    const key = (participant.name?.trim() || "Unnamed participant").toLowerCase();
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name),
  );
}
