import {
  formatRegistrationPackage,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";

const PROMO_LABELS: Record<RegistrationSource, string> = {
  workshop_promo: "Workshop",
  social: "Social",
};

export function getAdminWhatsAppNumber(): string | null {
  const raw = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP?.trim() ?? "";
  if (!raw) {
    return null;
  }

  const digits = raw.replace(/\D/g, "");
  return digits.length > 0 ? digits : null;
}

export function buildPaymentWhatsAppUrl(input: {
  programName: string;
  participantName: string;
  phone: string;
  selectedPackage: RegistrationPackage;
  packagePrice: number;
  source: RegistrationSource;
  friendName?: string | null;
  friendPhone?: string | null;
}): string | null {
  const adminNumber = getAdminWhatsAppNumber();
  if (!adminNumber) {
    return null;
  }

  const packageLabel = formatRegistrationPackage(input.selectedPackage);
  const promoLabel = PROMO_LABELS[input.source];
  const friendName = input.friendName?.trim() || null;
  const friendPhone = input.friendPhone?.trim() || null;
  const includeFriend =
    input.selectedPackage === "bareng_teman" &&
    Boolean(friendName) &&
    Boolean(friendPhone);

  const text = [
    "Halo Admin Digica,",
    `Saya sudah registrasi ${input.programName}.`,
    `Promo: ${promoLabel}`,
    `Nama: ${input.participantName}`,
    `No.Hp: ${input.phone}`,
    `Paket: ${packageLabel}`,
    ...(includeFriend
      ? [`Nama teman: ${friendName}`, `No.Hp teman: ${friendPhone}`]
      : []),
    "",
    "Saya mau minta detail pembayaran dong.",
    "",
    "Terima kasih.",
  ].join("\n");

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}

export function buildOtherProgramsWhatsAppUrl(input: {
  programName: string;
}): string | null {
  const adminNumber = getAdminWhatsAppNumber();
  if (!adminNumber) {
    return null;
  }

  const text = [
    "Halo Admin Digica,",
    `Saya tertarik dengan program ${input.programName}, tapi programnya sudah selesai.`,
    "",
    "Boleh info program Digica lainnya yang masih dibuka?",
  ].join("\n");

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}

export function buildInquiryWhatsAppUrl(input: {
  programName: string;
}): string | null {
  const adminNumber = getAdminWhatsAppNumber();
  if (!adminNumber) {
    return null;
  }

  const text = `Halo Admin Digica, Saya ingin bertanya mengenai ${input.programName}`;

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}
