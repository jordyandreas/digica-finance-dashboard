import type { ProgramType } from "@/services/programs.service";

const MINI_BOOTCAMP_INITIAL_SLOTS = 20;
const BOOTCAMP_INITIAL_SLOTS = 30;

export const PROMO_SLOT_TICK_MS = 20_000;

export type PromoSlotProgramType = Extract<
  ProgramType,
  "mini_bootcamp" | "bootcamp"
>;

export function getPromoInitialSlots(
  targetType: PromoSlotProgramType | null | undefined,
): number {
  return targetType === "bootcamp"
    ? BOOTCAMP_INITIAL_SLOTS
    : MINI_BOOTCAMP_INITIAL_SLOTS;
}

export function getPromoMinSlots(initialSlots: number): number {
  return Math.max(3, Math.round(initialSlots * 0.2));
}

export function getPromoSlotNumberClass(
  slots: number,
  initialSlots: number,
): string {
  const criticalAt = Math.round((initialSlots * 6) / 15);
  const warningAt = Math.round((initialSlots * 10) / 15);

  if (slots <= criticalAt) {
    return "text-destructive";
  }
  if (slots <= warningAt) {
    return "text-amber-600";
  }
  return "text-brand-deep";
}
