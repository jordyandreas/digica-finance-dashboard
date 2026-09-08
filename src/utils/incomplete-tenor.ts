import type { Payment } from "@/services/payments.service";

export type IncompleteTenorParticipant = {
  participantId: string;
  name: string;
  phone: string | null;
};

export type IncompleteTenorGroup = {
  paidTenor: number;
  count: number;
  participants: IncompleteTenorParticipant[];
};

export function isIncompleteTenorPayment(payment: Payment): boolean {
  return (
    payment.payment_type === "tenor" &&
    payment.paid_tenor != null &&
    payment.tenor != null &&
    payment.paid_tenor < payment.tenor
  );
}

function resolveParticipantName(payment: Payment): string {
  return payment.participant_name?.trim() || "Unnamed participant";
}

function resolveParticipantPhone(payment: Payment): string | null {
  const phone = payment.participant_phone?.trim();
  return phone ? phone : null;
}

/** Groups incomplete tenor payments by current paid_tenor (ascending). */
export function groupIncompleteTenorCounts(
  payments: Payment[],
): IncompleteTenorGroup[] {
  const groups = new Map<number, IncompleteTenorParticipant[]>();

  for (const payment of payments) {
    if (!isIncompleteTenorPayment(payment) || payment.paid_tenor == null) {
      continue;
    }
    const participants = groups.get(payment.paid_tenor) ?? [];
    participants.push({
      participantId: payment.participant_id ?? payment.id,
      name: resolveParticipantName(payment),
      phone: resolveParticipantPhone(payment),
    });
    groups.set(payment.paid_tenor, participants);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([paidTenor, participants]) => ({
      paidTenor,
      count: participants.length,
      participants: [...participants].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    }));
}
