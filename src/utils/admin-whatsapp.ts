import {
  formatRegistrationPackage,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";

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
}): string | null {
  const adminNumber = getAdminWhatsAppNumber();
  if (!adminNumber) {
    return null;
  }

  const packageLabel = formatRegistrationPackage(input.selectedPackage);
  const text = [
    "Halo Admin Digica,",
    `Saya sudah registrasi ${input.programName}.`,
    `Nama: ${input.participantName}`,
    `No.Hp: ${input.phone}`,
    `Paket: ${packageLabel}`,
    `Source: ${input.source}`,
    "",
    "Saya mau minta detail pembayaran.",
  ].join("\n");

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(text)}`;
}
