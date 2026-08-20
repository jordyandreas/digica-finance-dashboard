"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import type { AdminProfile } from "@/lib/profile-role";

interface DashboardShellProps {
  children: React.ReactNode;
  userProfile?: AdminProfile | null;
}

export function DashboardShell({ children, userProfile }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        isCollapsed={isCollapsed}
        userProfile={userProfile}
        onToggle={() => setIsCollapsed((collapsed) => !collapsed)}
      />
      <main className="relative flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
