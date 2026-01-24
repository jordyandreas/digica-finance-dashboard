"use client";

import { ReactElement } from "react";
import { FolderKanban, LayoutDashboard } from "lucide-react";

type MenuSubItem = {
  label: string;
  pathname: string;
  badgeCount?: number;
};

export type MenuItem = {
  label: string;
  pathname: string;
  icon: ReactElement;
  items: Array<MenuSubItem>;
};

export function useDashboardMenus() {
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
      items: [],
    },
  ];

  return menus;
}
