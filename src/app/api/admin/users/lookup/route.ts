import { NextResponse, type NextRequest } from "next/server";
import { getProfileRole } from "@/lib/profile-role";
import { createAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

const PER_PAGE = 1000;
const MAX_PAGES = 20;

export const dynamic = "force-dynamic";

export interface UserLookupResult {
  id: string;
  email: string;
  full_name: string | null;
}

/**
 * GET /api/admin/users/lookup?email=person@example.com
 *
 * Admin-only. Resolves an auth user by email (profiles has no email column).
 * supabase-js has no getUserByEmail, so we page through auth.admin.listUsers.
 */
export async function GET(request: NextRequest) {
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

  const email = request.nextUrl.searchParams.get("email")?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required" },
      { status: 400 },
    );
  }

  try {
    const admin = createAdminClient();

    for (let page = 1; page <= MAX_PAGES; page += 1) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage: PER_PAGE,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const match = data.users.find(
        (candidate) => candidate.email?.toLowerCase() === email,
      );

      if (match) {
        const { data: profile } = await admin
          .from("profiles")
          .select("full_name")
          .eq("id", match.id)
          .maybeSingle();

        const profileName =
          (profile as { full_name: string | null } | null)?.full_name?.trim() ||
          null;
        const metaName =
          typeof match.user_metadata?.full_name === "string"
            ? match.user_metadata.full_name.trim()
            : "";

        const result: UserLookupResult = {
          id: match.id,
          email: match.email ?? email,
          full_name: profileName || metaName || null,
        };
        return NextResponse.json({ data: result });
      }

      if (data.users.length < PER_PAGE) {
        break;
      }
    }

    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("User lookup failed:", error);
    return NextResponse.json(
      { error: "Failed to look up user" },
      { status: 500 },
    );
  }
}
