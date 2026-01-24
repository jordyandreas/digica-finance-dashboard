"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/atoms/button"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      {isSidebarOpen && (
        <DashboardSidebar onToggle={() => setIsSidebarOpen(false)} />
      )}
      <main
        className={`relative flex-1 overflow-y-auto p-8 ${
          isSidebarOpen ? "" : "pl-16 pt-16"
        }`}
      >
        {!isSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(true)}
            className="absolute left-4 top-4"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Open sidebar</span>
          </Button>
        )}
        {children}
      </main>
    </div>
  )
}
