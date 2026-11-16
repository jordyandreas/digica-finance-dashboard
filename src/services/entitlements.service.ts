import { supabase } from "@/lib/supabase";
import type { PostgrestError } from "@supabase/supabase-js";
import type { EntitlementStatus } from "@/constants/entitlement-status";
import {
  buildPaginationMeta,
  type PaginatedResponse,
  type PaginationParams,
} from "@/types/pagination";

export type { EntitlementStatus };

export interface LmsEntitlement {
  id: string;
  user_id: string;
  course_id: string;
  status: EntitlementStatus;
  starts_at: string;
  ends_at: string | null;
  created_at: string;
  granted_by: string | null;
  notes: string | null;
}

export interface LmsEntitlementListItem extends LmsEntitlement {
  course_title: string | null;
  course_slug: string | null;
  user_full_name: string | null;
  user_email: string | null;
}

export interface EntitlementsPaginatedParams extends PaginationParams {
  courseId?: string | "all";
  status?: EntitlementStatus | "all";
  search?: string;
}

export interface GrantEntitlementInput {
  user_id: string;
  course_id: string;
  notes?: string | null;
  /** ISO timestamp; null/undefined = no expiry. */
  ends_at?: string | null;
}

export interface UpdateEntitlementInput {
  status?: EntitlementStatus;
  ends_at?: string | null;
  notes?: string | null;
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

export async function getEntitlementsPaginated({
  page = 1,
  limit = 10,
  courseId = "all",
  status = "all",
  search = "",
}: EntitlementsPaginatedParams = {}): Promise<{
  data: PaginatedResponse<LmsEntitlementListItem> | null;
  error: PostgrestError | null;
}> {
  const from = (page - 1) * limit;
  const to = from + limit;

  let query = supabase
    .from("lms_entitlements")
    .select("*, lms_courses(title, slug)")
    .order("created_at", { ascending: false });

  if (courseId !== "all") {
    query = query.eq("course_id", courseId);
  }
  if (status !== "all") {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) {
    return { data: null, error };
  }

  const rows = (data ?? []) as Array<
    LmsEntitlement & {
      lms_courses: { title: string; slug: string } | null;
    }
  >;

  // profiles has no email; many early learners also have null full_name.
  // Enrich via admin batch route (auth.users + profiles + metadata).
  const userIds = [...new Set(rows.map((row) => row.user_id))];
  const names = new Map<string, string | null>();
  const emails = new Map<string, string | null>();

  if (userIds.length) {
    try {
      const response = await fetch("/api/admin/users/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: userIds }),
      });
      if (response.ok) {
        const payload = (await response.json()) as {
          data?: Array<{
            id: string;
            email: string | null;
            full_name: string | null;
          }>;
        };
        for (const user of payload.data ?? []) {
          names.set(user.id, user.full_name);
          emails.set(user.id, user.email);
        }
      }
    } catch {
      // Fall through to profiles-only enrichment below.
    }

    if (names.size === 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);
      for (const profile of (profiles ?? []) as Array<{
        id: string;
        full_name: string | null;
      }>) {
        names.set(profile.id, profile.full_name);
      }
    }
  }

  let items: LmsEntitlementListItem[] = rows.map(
    ({ lms_courses: course, ...entitlement }) => ({
      ...entitlement,
      course_title: course?.title ?? null,
      course_slug: course?.slug ?? null,
      user_full_name: names.get(entitlement.user_id) ?? null,
      user_email: emails.get(entitlement.user_id) ?? null,
    }),
  );

  const searchTerm = search.trim().toLowerCase();
  if (searchTerm) {
    items = items.filter((item) =>
      [
        item.user_full_name,
        item.user_email,
        item.user_id,
        item.course_title,
        item.notes,
      ]
        .filter((field): field is string => Boolean(field))
        .some((field) => field.toLowerCase().includes(searchTerm)),
    );
  }

  return {
    data: {
      data: items.slice(from, to),
      pagination: buildPaginationMeta(items.length, page, limit),
    },
    error: null,
  };
}

async function getCurrentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/** Grant (or re-activate) access. Upserts on (user_id, course_id). */
export async function grantEntitlement(input: GrantEntitlementInput): Promise<{
  data: LmsEntitlement | null;
  error: PostgrestError | null;
}> {
  const grantedBy = await getCurrentUserId();
  if (!grantedBy) {
    return {
      data: null,
      error: makeError("You must be signed in to grant access", "NO_SESSION"),
    };
  }

  const { data, error } = await supabase
    .from("lms_entitlements")
    .upsert(
      {
        user_id: input.user_id,
        course_id: input.course_id,
        status: "active",
        starts_at: new Date().toISOString(),
        ends_at: input.ends_at ?? null,
        notes: input.notes?.trim() || null,
        granted_by: grantedBy,
      },
      { onConflict: "user_id,course_id" },
    )
    .select("*")
    .single();

  return { data: data as LmsEntitlement | null, error };
}

export async function updateEntitlement(
  id: string,
  input: UpdateEntitlementInput,
): Promise<{
  data: LmsEntitlement | null;
  error: PostgrestError | null;
}> {
  const payload: Record<string, unknown> = {
    granted_by: await getCurrentUserId(),
  };
  if (input.status !== undefined) payload.status = input.status;
  if ("ends_at" in input) payload.ends_at = input.ends_at ?? null;
  if ("notes" in input) payload.notes = input.notes?.trim() || null;

  const { data, error } = await supabase
    .from("lms_entitlements")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  return { data: data as LmsEntitlement | null, error };
}

export async function revokeEntitlement(id: string) {
  return updateEntitlement(id, { status: "revoked" });
}
