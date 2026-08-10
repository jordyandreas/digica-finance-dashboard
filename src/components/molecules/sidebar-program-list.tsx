"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, Layers, Presentation, type LucideIcon } from "lucide-react";
import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";
import type { ProgramType } from "@/services/programs.service";

const PROGRAM_TYPE_ICONS: Record<ProgramType, LucideIcon> = {
  bootcamp: GraduationCap,
  mini_bootcamp: Layers,
  workshop: Presentation,
};

export type SidebarProgramItem = {
  label: string;
  pathname: string;
  type: ProgramType;
};

interface SidebarProgramListProps {
  items: SidebarProgramItem[];
  isLoading?: boolean;
  className?: string;
  itemClassName?: string;
}

export function SidebarProgramList({
  items,
  isLoading = false,
  className,
  itemClassName,
}: SidebarProgramListProps) {
  const pathname = usePathname();

  if (isLoading) {
    return (
      <div className={cn("space-y-1", className)}>
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-8 animate-pulse rounded-md bg-brand-periwinkle/30"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={cn("px-3 py-2", className)}>
        <Typography
          variant="body2"
          tagName="span"
          className="text-muted-foreground"
        >
          No active programs
        </Typography>
      </div>
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((item) => {
        const programId = extractProgramId(item.pathname);
        const isActive =
          Boolean(programId) && pathname.includes(`/programs/${programId}`);
        const Icon = PROGRAM_TYPE_ICONS[item.type];

        return (
          <Link
            key={item.pathname}
            href={item.pathname}
            className={cn(
              "flex items-center gap-2 truncate rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              itemClassName,
            )}
            title={item.label}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <Typography
              variant="body2"
              tagName="span"
              className="min-w-0 flex-1 truncate text-inherit"
            >
              {item.label}
            </Typography>
          </Link>
        );
      })}
    </div>
  );
}

function extractProgramId(pathname: string): string {
  const match = pathname.match(/\/programs\/([^/]+)/);
  return match?.[1] ?? "";
}
