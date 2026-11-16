export const COURSE_LEVELS = ["beginner", "intermediate", "advanced"] as const;
export type CourseLevel = (typeof COURSE_LEVELS)[number];

export const COURSE_LEVEL_ALL = "all" as const;

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export const COURSE_LEVEL_OPTIONS = COURSE_LEVELS.map((level) => ({
  label: COURSE_LEVEL_LABELS[level],
  value: level,
}));

export const COURSE_LEVEL_FILTER_OPTIONS = [
  { label: "All levels", value: COURSE_LEVEL_ALL },
  ...COURSE_LEVEL_OPTIONS,
] as const;

export const COURSE_STATUS_ALL = "all" as const;
export const COURSE_STATUSES = ["draft", "published"] as const;
export type CourseStatus = (typeof COURSE_STATUSES)[number];

export const COURSE_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: COURSE_STATUS_ALL },
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
] as const;

export function isCourseLevel(value: string): value is CourseLevel {
  return (COURSE_LEVELS as readonly string[]).includes(value);
}
