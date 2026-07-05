import { z } from "zod";

export const programPublicSlugSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .pipe(
    z.union([
      z.literal(""),
      z
        .string()
        .min(3, "Slug must be at least 3 characters")
        .max(50, "Slug must be at most 50 characters")
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Use lowercase letters, numbers, and hyphens only",
        ),
    ]),
  );

export function normalizeProgramPublicSlug(
  value: string | null | undefined,
): string | null {
  const parsed = programPublicSlugSchema.safeParse(value ?? "");
  if (!parsed.success) {
    return null;
  }

  const normalized = parsed.data;
  return normalized || null;
}
