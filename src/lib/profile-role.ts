import type { SupabaseClient, User } from "@supabase/supabase-js";

export type ProfileRole = "admin" | "student";

type ProfileRoleRow = {
  role: string;
};

type ProfileNameRow = {
  full_name: string | null;
};

export type AdminProfile = {
  name: string;
  email: string;
  initials: string;
};

export const ADMIN_UNAUTHORIZED_MESSAGE =
  "This account does not have admin access.";

export async function getProfileRole(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileRole | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const role = (data as ProfileRoleRow).role;
  if (role === "admin" || role === "student") {
    return role;
  }

  return null;
}

function normalizeDisplayName(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function getEmailLocalPart(email: string | undefined): string | null {
  if (!email) return null;

  const [localPart] = email.split("@");
  return normalizeDisplayName(localPart);
}

export function getInitials(name: string): string {
  const segments = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (segments.length === 0) {
    return "AD";
  }

  if (segments.length === 1) {
    return segments[0].slice(0, 2).toUpperCase();
  }

  return segments
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
}

export async function getCurrentAdminProfile(
  supabase: SupabaseClient,
  user: User,
): Promise<AdminProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    return null;
  }

  const profile = data as ProfileNameRow | null;
  const metadataFullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name
      : null;
  const email = user.email?.trim();

  if (!email) {
    return null;
  }

  const name =
    normalizeDisplayName(profile?.full_name) ??
    normalizeDisplayName(metadataFullName) ??
    getEmailLocalPart(email) ??
    "Admin";

  return {
    name,
    email,
    initials: getInitials(name),
  };
}
