import { z } from "zod";
import { COURSE_LEVELS } from "@/constants/course-levels";
import { slugifyFromTitle } from "@/utils/slugify";
import { isValidYouTubeVideoRef } from "@/utils/youtube";

const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters")
  .max(120, "Slug must be at most 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only",
  );

export const courseSlugSchema = slugSchema;

const optionalWholeNumber = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === "" || /^\d+$/.test(value), { message });

export const courseFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  slug: courseSlugSchema,
  description: z.string().trim(),
  level: z.enum(COURSE_LEVELS, { message: "Level is required" }),
  price_label: z.string().trim(),
  compare_at_price_label: z.string().trim(),
  price_idr: optionalWholeNumber("Enter price as a whole number (IDR)"),
  is_purchasable: z.boolean(),
  whatsapp_offer_message: z.string().trim(),
  sessions: optionalWholeNumber("Enter sessions as a whole number"),
  instructor_name: z.string().trim(),
  instructor_credentials: z.string().trim(),
  instructor_avatar_url: z.string().trim(),
  /** One learning outcome per line. */
  outcomes: z.string(),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

export function buildDefaultCourseFormValues(): CourseFormValues {
  return {
    title: "",
    slug: "",
    description: "",
    level: "beginner",
    price_label: "",
    compare_at_price_label: "",
    price_idr: "",
    is_purchasable: true,
    whatsapp_offer_message: "",
    sessions: "",
    instructor_name: "",
    instructor_credentials: "",
    instructor_avatar_url: "",
    outcomes: "",
  };
}

export function parseOptionalInt(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

export function parseOutcomesInput(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function outcomesToInput(outcomes: unknown): string {
  if (!Array.isArray(outcomes)) {
    return "";
  }
  return outcomes.filter((item) => typeof item === "string").join("\n");
}

export function normalizeCourseSlug(value: string | null | undefined): string {
  const trimmed = (value ?? "").trim().toLowerCase();
  return trimmed || slugifyFromTitle("");
}

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

export const lessonDraftSchema = z.object({
  id: z.string().optional(),
  slug: slugSchema,
  title: z.string().trim().min(1, "Lesson title is required"),
  excerpt: z.string().trim(),
  duration_minutes: z
    .number({ message: "Duration must be a number" })
    .int("Duration must be a whole number")
    .min(0, "Duration cannot be negative"),
  cover_image_url: z.string().trim(),
  video_url: z
    .string()
    .trim()
    .refine(isValidYouTubeVideoRef, "Paste a valid YouTube link or video id"),
  content: z.string(),
});

export const moduleDraftSchema = z.object({
  id: z.string().optional(),
  title: z.string().trim().min(1, "Module title is required"),
  lessons: z.array(lessonDraftSchema),
});

export const curriculumSchema = z.array(moduleDraftSchema);

export type LessonDraft = z.infer<typeof lessonDraftSchema>;
export type ModuleDraft = z.infer<typeof moduleDraftSchema>;

/** Returns the first human-readable curriculum problem, or null when valid. */
export function validateCurriculum(modules: ModuleDraft[]): string | null {
  const parsed = curriculumSchema.safeParse(modules);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const [moduleIndex, , lessonIndex] = issue.path;
    const location =
      typeof moduleIndex === "number"
        ? typeof lessonIndex === "number"
          ? `Module ${moduleIndex + 1}, lesson ${lessonIndex + 1}: `
          : `Module ${moduleIndex + 1}: `
        : "";
    return `${location}${issue.message}`;
  }

  for (const [moduleIndex, moduleDraft] of parsed.data.entries()) {
    const seen = new Set<string>();
    for (const [lessonIndex, lesson] of moduleDraft.lessons.entries()) {
      if (seen.has(lesson.slug)) {
        return `Module ${moduleIndex + 1}, lesson ${lessonIndex + 1}: duplicate slug "${lesson.slug}" in this module`;
      }
      seen.add(lesson.slug);
    }
  }

  return null;
}
