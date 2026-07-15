import { formatCurrency } from "@/utils/currency";

export const REGISTRATION_SOURCES = ["workshop_promo", "social"] as const;

export type RegistrationSource = (typeof REGISTRATION_SOURCES)[number];

export const REGISTRATION_PACKAGES = [
  "individual",
  "bareng_teman",
  "social_standard",
] as const;

export type RegistrationPackage = (typeof REGISTRATION_PACKAGES)[number];

export interface RegistrationOffer {
  package: RegistrationPackage;
  price: number;
  label: string;
  description: string;
}

export interface ProgramOfferPrices {
  promo_individual_price: number | null;
  promo_bareng_teman_price: number | null;
  /** Program list/base price — used for social / standard package */
  price: number | null;
}

const PACKAGE_LABELS: Record<RegistrationPackage, string> = {
  individual: "Individual",
  bareng_teman: "Bareng teman",
  social_standard: "Standard",
};

const PACKAGE_SECTION_LABELS: Record<RegistrationPackage, string> = {
  individual: "Paket 1: Individual",
  bareng_teman: "Paket 2: Bareng teman",
  social_standard: "Standard",
};

const SOURCE_LABELS: Record<RegistrationSource, string> = {
  workshop_promo: "Workshop promo",
  social: "Social",
};

const PACKAGES_BY_SOURCE: Record<RegistrationSource, RegistrationPackage[]> = {
  workshop_promo: ["individual", "bareng_teman"],
  social: ["social_standard"],
};

function toPositivePrice(value: number | null | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return null;
  }
  return Math.round(value);
}

function priceForPackage(
  selectedPackage: RegistrationPackage,
  prices: ProgramOfferPrices,
): number | null {
  if (selectedPackage === "individual") {
    return toPositivePrice(prices.promo_individual_price);
  }
  if (selectedPackage === "bareng_teman") {
    return toPositivePrice(prices.promo_bareng_teman_price);
  }
  // Social / standard uses the program's main `price`
  return toPositivePrice(prices.price);
}

function buildOffer(
  selectedPackage: RegistrationPackage,
  price: number,
): RegistrationOffer {
  const perPerson =
    selectedPackage === "bareng_teman" ? " / orang (minimal 2 orang)" : " / orang";

  return {
    package: selectedPackage,
    price,
    label: PACKAGE_SECTION_LABELS[selectedPackage],
    description: `${formatCurrency(price)}${perPerson}`,
  };
}

export function isRegistrationSource(
  value: string | null | undefined,
): value is RegistrationSource {
  return value === "workshop_promo" || value === "social";
}

export function resolveRegistrationSource(
  value: string | null | undefined,
): RegistrationSource {
  return isRegistrationSource(value) ? value : "social";
}

export function getOffersForSource(
  source: RegistrationSource,
  prices: ProgramOfferPrices,
): RegistrationOffer[] {
  return PACKAGES_BY_SOURCE[source].flatMap((selectedPackage) => {
    const price = priceForPackage(selectedPackage, prices);
    if (price == null) {
      return [];
    }
    return [buildOffer(selectedPackage, price)];
  });
}

export function getOfferForPackage(
  source: RegistrationSource,
  selectedPackage: RegistrationPackage,
  prices: ProgramOfferPrices,
): RegistrationOffer | null {
  if (!PACKAGES_BY_SOURCE[source].includes(selectedPackage)) {
    return null;
  }

  const price = priceForPackage(selectedPackage, prices);
  if (price == null) {
    return null;
  }

  return buildOffer(selectedPackage, price);
}

export function formatRegistrationSource(
  source: string | null | undefined,
): string {
  if (isRegistrationSource(source)) {
    return SOURCE_LABELS[source];
  }
  return "—";
}

export function formatRegistrationPackage(
  selectedPackage: string | null | undefined,
): string {
  if (
    selectedPackage === "individual" ||
    selectedPackage === "bareng_teman" ||
    selectedPackage === "social_standard"
  ) {
    return PACKAGE_LABELS[selectedPackage];
  }
  return "—";
}

export function isPackageKeyForSource(
  source: RegistrationSource,
  selectedPackage: string,
): selectedPackage is RegistrationPackage {
  return (PACKAGES_BY_SOURCE[source] as string[]).includes(selectedPackage);
}

export function isPackageForSource(
  source: RegistrationSource,
  selectedPackage: string,
  prices: ProgramOfferPrices,
): selectedPackage is RegistrationPackage {
  if (!isPackageKeyForSource(source, selectedPackage)) {
    return false;
  }

  return getOfferForPackage(source, selectedPackage, prices) != null;
}

export function emptyProgramOfferPrices(): ProgramOfferPrices {
  return {
    promo_individual_price: null,
    promo_bareng_teman_price: null,
    price: null,
  };
}
