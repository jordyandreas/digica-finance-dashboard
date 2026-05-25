"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";
import { LogOut, X } from "lucide-react";
import { useDashboardMenus } from "@/hooks/use-dashboard-menus";

interface DashboardSidebarProps {
  onToggle?: () => void;
}

export function DashboardSidebar({ onToggle }: DashboardSidebarProps) {
  const pathname = usePathname();
  const menus = useDashboardMenus();

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-brand-periwinkle/60 bg-gradient-premium p-6">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo/logo-digica.webp"
            alt="Digica Academy"
            width={160}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>
        {onToggle && (
          <Button variant="ghost" size="icon" onClick={onToggle}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        )}
      </div>
      <nav className="flex-1 space-y-2">
        {menus.map((item) => {
          const isActive =
            pathname === item.pathname ||
            pathname.startsWith(`${item.pathname}/`);
          return (
            <Link
              key={item.pathname}
              href={item.pathname}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.icon}
              <Typography variant="body2" tagName="span" className="text-inherit">
                {item.label}
              </Typography>
            </Link>
          );
        })}
      </nav>
      <Link
        href="/logout"
        className={cn(
          "mt-6 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <LogOut className="h-4 w-4" />
        <Typography variant="body2" tagName="span" className="text-inherit">
          Logout
        </Typography>
      </Link>
    </aside>
  );
}
