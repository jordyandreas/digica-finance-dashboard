"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed((collapsed) => !collapsed)}
      />
      <main className="relative flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}
