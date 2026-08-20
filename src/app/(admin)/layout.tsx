import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard-shell";
import { getCurrentAdminProfile, getProfileRole } from "@/lib/profile-role";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const role = user ? await getProfileRole(supabase, user.id) : null;

  if (!user || role !== "admin") {
    redirect("/login?error=unauthorized");
  }

  const userProfile = await getCurrentAdminProfile(supabase, user);

  return <DashboardShell userProfile={userProfile}>{children}</DashboardShell>;
}
