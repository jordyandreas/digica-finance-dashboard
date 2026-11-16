import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { CourseLevel, CourseStatus } from "@/constants/course-levels";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";
import { normalizeYouTubeVideoRef } from "@/utils/youtube";

export type { CourseLevel, CourseStatus };

export interface LmsCourse {
  id: string;
  slug: string;
  title: string;
  description: string;
  status: CourseStatus;
  level: CourseLevel;
  price_label: string | null;
  compare_at_price_label: string | null;
  price_idr: number | null;
  whatsapp_offer_message: string | null;
  is_purchasable: boolean;
  sessions: number | null;
  rating: number | null;
  review_count: number | null;
  student_count: number | null;
  instructor_name: string | null;
  instructor_credentials: string | null;
  instructor_avatar_url: string | null;
  outcomes: string[];
  created_at: string;
  updated_at: string;
}

export interface LmsCourseListItem extends LmsCourse {
  module_count: number;
  lesson_count: number;
}

export interface LmsLessonMedia {
  video_url: string;
  content: string;
}

export interface LmsLessonDetail {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  excerpt: string;
  duration_minutes: number;
  cover_image_url: string | null;
  sort_order: number;
  media: LmsLessonMedia;
}

export interface LmsModuleDetail {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
  lessons: LmsLessonDetail[];
}

export interface LmsCourseDetail extends LmsCourse {
  modules: LmsModuleDetail[];
}

export type CreateCourseInput = Pick<
  LmsCourse,
  | "slug"
  | "title"
  | "description"
  | "status"
  | "level"
  | "price_label"
  | "compare_at_price_label"
  | "price_idr"
  | "whatsapp_offer_message"
  | "is_purchasable"
  | "sessions"
  | "instructor_name"
  | "instructor_credentials"
  | "instructor_avatar_url"
  | "outcomes"
>;

export type UpdateCourseInput = Partial<CreateCourseInput>;

export interface CurriculumLessonInput {
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  duration_minutes: number;
  cover_image_url: string;
  video_url: string;
  content: string;
}

export interface CurriculumModuleInput {
  id?: string;
  title: string;
  lessons: CurriculumLessonInput[];
}

export interface CoursesPaginatedParams extends PaginationParams {
  status?: CourseStatus | "all";
  level?: CourseLevel | "all";
  search?: string;
}

function makeError(message: string, code: string): PostgrestError {
  return {
    message,
    details: "",
    hint: "",
    code,
    name: "PostgrestError",
  } as PostgrestError;
}

function toPostgrestError(error: unknown): PostgrestError {
  if (error && typeof error === "object" && "message" in error) {
    return error as PostgrestError;
  }
  return makeError("Unexpected error", "UNEXPECTED");
}

function mapCourseRow(row: Record<string, unknown>): LmsCourse {
  const { lms_modules: _modules, ...rest } = row;
  void _modules;
  return {
    ...(rest as unknown as LmsCourse),
    outcomes: Array.isArray(rest.outcomes)
      ? (rest.outcomes as unknown[]).filter(
          (item): item is string => typeof item === "string",
        )
      : [],
  };
}

function compareCourses(a: LmsCourse, b: LmsCourse): number {
  const aPublished = a.status === "published";
  const bPublished = b.status === "published";
  if (aPublished !== bPublished) {
    return aPublished ? -1 : 1;
  }
  return b.updated_at.localeCompare(a.updated_at);
}

function buildCoursePayload(
  input: CreateCourseInput | UpdateCourseInput,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      payload[key] = value;
    }
  }
  payload.updated_at = new Date().toISOString();
  return payload;
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

export async function getCoursesPaginated({
  page = 1,
  limit = 10,
  status = "all",
  level = "all",
  search = "",
}: CoursesPaginatedParams = {}): Promise<{
  data: PaginatedResponse<LmsCourseListItem> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit;

  let query = supabase
    .from("lms_courses")
    .select("*, lms_modules(id, lms_lessons(id))");

  if (status !== "all") {
    query = query.eq("status", status);
  }
  if (level !== "all") {
    query = query.eq("level", level);
  }

  const { data, error } = await query;
  if (error) {
    return { data: null, error };
  }

  let courses: LmsCourseListItem[] = (
    (data ?? []) as Array<Record<string, unknown>>
  ).map((row) => {
    const modules = (row.lms_modules ?? []) as Array<{
      lms_lessons?: unknown[];
    }>;
    return {
      ...mapCourseRow(row),
      module_count: modules.length,
      lesson_count: modules.reduce(
        (sum, courseModule) => sum + (courseModule.lms_lessons?.length ?? 0),
        0,
      ),
    };
  });

  courses.sort(compareCourses);

  const searchTerm = search.trim().toLowerCase();
  if (searchTerm) {
    courses = courses.filter((course) =>
      [course.title, course.slug, course.description, course.instructor_name]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(searchTerm)),
    );
  }

  return {
    data: {
      data: courses.slice(from, to),
      pagination: buildPaginationMeta(courses.length, page, limit),
    },
    error: null,
  };
}

/** Lightweight list for selects (id + title). */
export async function getCourseOptions(): Promise<{
  data: Array<Pick<LmsCourse, "id" | "title" | "slug" | "status">> | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("lms_courses")
    .select("id, title, slug, status")
    .order("title");

  return {
    data: (data ?? null) as Array<
      Pick<LmsCourse, "id" | "title" | "slug" | "status">
    > | null,
    error,
  };
}

export async function getCourseById(id: string): Promise<{
  data: LmsCourseDetail | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("lms_courses")
    .select(
      `*,
      lms_modules (
        id, course_id, title, sort_order,
        lms_lessons (
          id, module_id, slug, title, excerpt, duration_minutes,
          cover_image_url, sort_order,
          lms_lesson_media ( video_url, content )
        )
      )`,
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { data: null, error };
  }

  const row = data as Record<string, unknown>;
  const rawModules = (row.lms_modules ?? []) as Array<
    Record<string, unknown> & { lms_lessons?: Array<Record<string, unknown>> }
  >;

  const modules: LmsModuleDetail[] = rawModules
    .map((rawModule) => {
      const lessons = (rawModule.lms_lessons ?? [])
        .map((rawLesson): LmsLessonDetail => {
          const mediaRaw = rawLesson.lms_lesson_media as
            | LmsLessonMedia
            | LmsLessonMedia[]
            | null;
          const media = Array.isArray(mediaRaw) ? mediaRaw[0] : mediaRaw;
          const { lms_lesson_media: _media, ...lessonRest } = rawLesson;
          void _media;
          return {
            ...(lessonRest as unknown as Omit<LmsLessonDetail, "media">),
            media: {
              video_url: media?.video_url ?? "",
              content: media?.content ?? "",
            },
          };
        })
        .sort((a, b) => a.sort_order - b.sort_order);

      const { lms_lessons: _lessons, ...moduleRest } = rawModule;
      void _lessons;
      return {
        ...(moduleRest as unknown as Omit<LmsModuleDetail, "lessons">),
        lessons,
      };
    })
    .sort((a, b) => a.sort_order - b.sort_order);

  return { data: { ...mapCourseRow(row), modules }, error: null };
}

export async function getCourseBySlug(
  slug: string,
  excludeId?: string,
): Promise<{
  data: Pick<LmsCourse, "id" | "slug"> | null;
  error: PostgrestError | null;
}> {
  let query = supabase.from("lms_courses").select("id, slug").eq("slug", slug);
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  const { data, error } = await query.maybeSingle();
  return { data: data as Pick<LmsCourse, "id" | "slug"> | null, error };
}

// ---------------------------------------------------------------------------
// Write
// ---------------------------------------------------------------------------

export async function createCourse(input: CreateCourseInput): Promise<{
  data: LmsCourse | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("lms_courses")
    .insert(buildCoursePayload(input))
    .select("*")
    .single();

  return { data: data ? mapCourseRow(data) : null, error };
}

export async function updateCourse(
  id: string,
  input: UpdateCourseInput,
): Promise<{
  data: LmsCourse | null;
  error: PostgrestError | null;
}> {
  const { data, error } = await supabase
    .from("lms_courses")
    .update(buildCoursePayload(input))
    .eq("id", id)
    .select("*")
    .single();

  return { data: data ? mapCourseRow(data) : null, error };
}

export async function publishCourse(id: string) {
  return updateCourse(id, { status: "published" });
}

export async function unpublishCourse(id: string) {
  return updateCourse(id, { status: "draft" });
}

/**
 * Deleting a course cascades to modules, lessons, media AND entitlements, so
 * refuse when any learner has been granted access (revoke/expire is the safe path).
 */
export async function deleteCourse(id: string): Promise<{
  error: PostgrestError | null;
}> {
  const { count, error: countError } = await supabase
    .from("lms_entitlements")
    .select("id", { count: "exact", head: true })
    .eq("course_id", id);

  if (countError) {
    return { error: countError };
  }

  if ((count ?? 0) > 0) {
    return {
      error: makeError(
        "This course has entitlements. Revoke them and keep the course as a draft instead of deleting it.",
        "COURSE_HAS_ENTITLEMENTS",
      ),
    };
  }

  const { error } = await supabase.from("lms_courses").delete().eq("id", id);
  return { error };
}

// ---------------------------------------------------------------------------
// Curriculum
// ---------------------------------------------------------------------------

function unwrap<T>(result: { data: T | null; error: PostgrestError | null }): T {
  if (result.error) {
    throw result.error;
  }
  return (result.data ?? ([] as unknown)) as T;
}

/**
 * Replace the whole curriculum of a course with `modules`.
 *
 * Items carrying an `id` that already belongs to the course are updated in
 * place (keeps lesson ids stable); items without a known id are inserted; rows
 * that are no longer present are deleted (lessons/media cascade). Order of the
 * arrays becomes `sort_order`. Not transactional: on failure the editor should
 * reload and retry.
 */
export async function replaceCurriculum(
  courseId: string,
  modules: CurriculumModuleInput[],
): Promise<{ error: PostgrestError | null }> {
  try {
    const existingModules = unwrap<Array<{ id: string }>>(
      await supabase.from("lms_modules").select("id").eq("course_id", courseId),
    );
    const existingModuleIds = new Set(existingModules.map((row) => row.id));

    const existingLessons = existingModuleIds.size
      ? unwrap<Array<{ id: string }>>(
          await supabase
            .from("lms_lessons")
            .select("id")
            .in("module_id", [...existingModuleIds]),
        )
      : [];
    const existingLessonIds = new Set(existingLessons.map((row) => row.id));

    const keptModuleIds = new Set(
      modules
        .map((item) => item.id)
        .filter((id): id is string => Boolean(id && existingModuleIds.has(id))),
    );
    const keptLessonIds = new Set(
      modules
        .flatMap((item) => item.lessons.map((lesson) => lesson.id))
        .filter((id): id is string => Boolean(id && existingLessonIds.has(id))),
    );

    // 1) Delete removed lessons, then removed modules (frees unique slugs first).
    const removedLessonIds = [...existingLessonIds].filter(
      (id) => !keptLessonIds.has(id),
    );
    if (removedLessonIds.length) {
      const { error } = await supabase
        .from("lms_lessons")
        .delete()
        .in("id", removedLessonIds);
      if (error) throw error;
    }

    const removedModuleIds = [...existingModuleIds].filter(
      (id) => !keptModuleIds.has(id),
    );
    if (removedModuleIds.length) {
      const { error } = await supabase
        .from("lms_modules")
        .delete()
        .in("id", removedModuleIds);
      if (error) throw error;
    }

    // 2) Upsert modules; remember the final id for every position.
    const moduleIds: string[] = new Array(modules.length);
    const existingModuleRows: Array<Record<string, unknown>> = [];
    const newModuleRows: Array<{ index: number; row: Record<string, unknown> }> =
      [];

    modules.forEach((item, index) => {
      const row = {
        course_id: courseId,
        title: item.title.trim(),
        sort_order: index,
      };
      if (item.id && existingModuleIds.has(item.id)) {
        moduleIds[index] = item.id;
        existingModuleRows.push({ id: item.id, ...row });
      } else {
        newModuleRows.push({ index, row });
      }
    });

    if (existingModuleRows.length) {
      const { error } = await supabase
        .from("lms_modules")
        .upsert(existingModuleRows, { onConflict: "id" });
      if (error) throw error;
    }

    if (newModuleRows.length) {
      const inserted = unwrap<Array<{ id: string }>>(
        await supabase
          .from("lms_modules")
          .insert(newModuleRows.map((entry) => entry.row))
          .select("id"),
      );
      newModuleRows.forEach((entry, position) => {
        moduleIds[entry.index] = inserted[position].id;
      });
    }

    // 3) Upsert lessons (existing ids keep identity, even across modules).
    const existingLessonRows: Array<Record<string, unknown>> = [];
    const newLessonRows: Array<{
      moduleIndex: number;
      lessonIndex: number;
      row: Record<string, unknown>;
    }> = [];
    const lessonIds: string[][] = modules.map((item) =>
      new Array(item.lessons.length),
    );

    modules.forEach((courseModule, moduleIndex) => {
      courseModule.lessons.forEach((lesson, lessonIndex) => {
        const row = {
          module_id: moduleIds[moduleIndex],
          slug: lesson.slug.trim(),
          title: lesson.title.trim(),
          excerpt: lesson.excerpt.trim(),
          duration_minutes: lesson.duration_minutes,
          cover_image_url: lesson.cover_image_url.trim() || null,
          sort_order: lessonIndex,
        };
        if (lesson.id && existingLessonIds.has(lesson.id)) {
          lessonIds[moduleIndex][lessonIndex] = lesson.id;
          existingLessonRows.push({ id: lesson.id, ...row });
        } else {
          newLessonRows.push({ moduleIndex, lessonIndex, row });
        }
      });
    });

    if (existingLessonRows.length) {
      const { error } = await supabase
        .from("lms_lessons")
        .upsert(existingLessonRows, { onConflict: "id" });
      if (error) throw error;
    }

    if (newLessonRows.length) {
      const inserted = unwrap<Array<{ id: string }>>(
        await supabase
          .from("lms_lessons")
          .insert(newLessonRows.map((entry) => entry.row))
          .select("id"),
      );
      newLessonRows.forEach((entry, position) => {
        lessonIds[entry.moduleIndex][entry.lessonIndex] = inserted[position].id;
      });
    }

    // 4) Upsert media (one row per lesson, keyed by lesson_id).
    const mediaRows = modules.flatMap((courseModule, moduleIndex) =>
      courseModule.lessons.map((lesson, lessonIndex) => ({
        lesson_id: lessonIds[moduleIndex][lessonIndex],
        video_url: normalizeYouTubeVideoRef(lesson.video_url),
        content: lesson.content,
      })),
    );

    if (mediaRows.length) {
      const { error } = await supabase
        .from("lms_lesson_media")
        .upsert(mediaRows, { onConflict: "lesson_id" });
      if (error) throw error;
    }

    await supabase
      .from("lms_courses")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", courseId);

    return { error: null };
  } catch (error) {
    return { error: toPostgrestError(error) };
  }
}
