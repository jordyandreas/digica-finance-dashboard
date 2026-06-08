import type { Payment } from "@/services/payments.service";
import type { Participant } from "@/services/participants.service";

export function getPaymentStatusByParticipantId(
  payments: Payment[],
): Record<string, string> {
  return Object.fromEntries(
    payments
      .filter(
        (payment): payment is Payment & { participant_id: string; status: string } =>
          Boolean(payment.participant_id && payment.status),
      )
      .map((payment) => [payment.participant_id, payment.status]),
  );
}

export function withPaymentStatusFromPayments(
  participants: Participant[],
  payments: Payment[],
): Participant[] {
  const paymentStatusByParticipantId = getPaymentStatusByParticipantId(payments);

  return participants.map((participant) => ({
    ...participant,
    payment_status:
      paymentStatusByParticipantId[participant.id] ??
      participant.payment_status ??
      "pending",
  }));
}
