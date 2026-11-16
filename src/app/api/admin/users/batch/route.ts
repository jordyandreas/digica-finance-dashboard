import { NextResponse, type NextRequest } from "next/server";
import { getProfileRole } from "@/lib/profile-role";
import { createAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

export interface UserBatchItem {
  id: string;
  email: string | null;
  full_name: string | null;
}

/**
 * POST /api/admin/users/batch
 * Body: { ids: string[] }
 *
 * Admin-only. Resolves email + display name for auth user ids
 * (profiles has no email; full_name is often null for early signups).
 */
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const role = await getProfileRole(supabase, user.id);
  if (role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let ids: string[] = [];
  try {
    const body = (await request.json()) as { ids?: unknown };
    if (Array.isArray(body.ids)) {
      ids = [
        ...new Set(
          body.ids.filter(
            (id): id is string => typeof id === "string" && id.length > 0,
          ),
        ),
      ].slice(0, 100);
    }
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (ids.length === 0) {
    return NextResponse.json({ data: [] satisfies UserBatchItem[] });
  }

  try {
    const admin = createAdminClient();

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, full_name")
      .in("id", ids);

    const profileNames = new Map<string, string | null>();
    for (const profile of (profiles ?? []) as Array<{
      id: string;
      full_name: string | null;
    }>) {
      profileNames.set(profile.id, profile.full_name);
    }

    const items = await Promise.all(
      ids.map(async (id): Promise<UserBatchItem> => {
        const { data, error } = await admin.auth.admin.getUserById(id);
        if (error || !data.user) {
          return {
            id,
            email: null,
            full_name: profileNames.get(id) ?? null,
          };
        }

        const metaName =
          typeof data.user.user_metadata?.full_name === "string"
            ? data.user.user_metadata.full_name.trim()
            : "";
        const profileName = profileNames.get(id)?.trim() || null;

        return {
          id,
          email: data.user.email ?? null,
          full_name: profileName || metaName || null,
        };
      }),
    );

    return NextResponse.json({ data: items });
  } catch (error) {
    console.error("User batch lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to look up users" },
      { status: 500 },
    );
  }
}
