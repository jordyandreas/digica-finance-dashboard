"use client";

import { ReactElement } from "react";
import { BookOpen, FolderKanban, LayoutDashboard } from "lucide-react";
import { useActivePrograms } from "@/app/(admin)/programs/_hooks/use-programs";
import type { ProgramType } from "@/services/programs.service";

type MenuSubItem = {
  label: string;
  pathname: string;
  type: ProgramType;
  badgeCount?: number;
};

export type MenuItem = {
  label: string;
  pathname: string;
  icon: ReactElement;
  items: Array<MenuSubItem>;
  isLoadingItems?: boolean;
};

export function useDashboardMenus() {
  const { data: activePrograms = [], isLoading } = useActivePrograms(5);

  const menus: MenuItem[] = [
    {
      label: "Dashboard",
      pathname: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      items: [],
    },
    {
      label: "Programs",
      pathname: "/programs",
      icon: <FolderKanban className="h-5 w-5" />,
      isLoadingItems: isLoading,
      items: activePrograms.map((program) => ({
        label: program.name,
        pathname: `/programs/${program.id}/participants`,
        type: program.type,
      })),
    },
    {
      label: "Articles",
      pathname: "/articles",
      icon: <BookOpen className="h-5 w-5" />,
      items: [],
    },
  ];

  return menus;
}
