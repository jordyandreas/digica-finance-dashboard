"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { Typography } from "@/components/atoms/typography";
import { SidebarProgramList } from "@/components/molecules/sidebar-program-list";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useDashboardMenus, type MenuItem } from "@/hooks/use-dashboard-menus";

interface DashboardSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const FLYOUT_CLOSE_DELAY_MS = 150;

export function DashboardSidebar({
  isCollapsed,
  onToggle,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const menus = useDashboardMenus();
  const [isProgramsOpen, setIsProgramsOpen] = useState(() =>
    pathname.startsWith("/programs"),
  );
  const [prevPathname, setPrevPathname] = useState(pathname);

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (pathname.startsWith("/programs")) {
      setIsProgramsOpen(true);
    }
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-brand-periwinkle/60 bg-gradient-premium transition-[width] duration-200",
        isCollapsed ? "w-16 p-2" : "w-64 p-6",
      )}
    >
      <div
        className={cn(
          "mb-6",
          isCollapsed
            ? "flex flex-col items-center gap-2"
            : "flex items-center justify-between",
        )}
      >
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center",
            isCollapsed && "justify-center",
          )}
        >
          {isCollapsed ? (
            <Image
              src="/logo/logo-digica-initial.webp"
              alt="Digica Academy"
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          ) : (
            <Image
              src="/logo/logo-digica.webp"
              alt="Digica Academy"
              width={160}
              height={40}
              className="h-10 w-auto"
              priority
            />
          )}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className={cn(isCollapsed && "h-8 w-8")}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          </span>
        </Button>
      </div>

      <nav className={cn("flex-1 space-y-2", isCollapsed && "space-y-1")}>
        {menus.map((item) => (
          <SidebarNavItem
            key={item.pathname}
            item={item}
            isCollapsed={isCollapsed}
            pathname={pathname}
            isProgramsOpen={isProgramsOpen}
            onTogglePrograms={() => setIsProgramsOpen((open) => !open)}
          />
        ))}
      </nav>

      <Link
        href="/logout"
        className={cn(
          "mt-6 flex items-center rounded-lg text-sm font-medium transition-colors",
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          isCollapsed ? "justify-center p-2" : "gap-3 px-3 py-2",
        )}
        title="Logout"
      >
        <LogOut className="h-4 w-4 shrink-0" />
        {!isCollapsed && (
          <Typography variant="body2" tagName="span" className="text-inherit">
            Logout
          </Typography>
        )}
      </Link>
    </aside>
  );
}

interface SidebarNavItemProps {
  item: MenuItem;
  isCollapsed: boolean;
  pathname: string;
  isProgramsOpen: boolean;
  onTogglePrograms: () => void;
}

function SidebarNavItem({
  item,
  isCollapsed,
  pathname,
  isProgramsOpen,
  onTogglePrograms,
}: SidebarNavItemProps) {
  const isProgramsItem = item.pathname === "/programs";
  const isActive =
    pathname === item.pathname || pathname.startsWith(`${item.pathname}/`);

  if (isCollapsed && isProgramsItem) {
    return (
      <CollapsedProgramsNavItem
        item={item}
        isActive={isActive}
      />
    );
  }

  if (isCollapsed) {
    return (
      <Link
        href={item.pathname}
        className={cn(
          "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
        )}
        title={item.label}
      >
        {item.icon}
        <span className="sr-only">{item.label}</span>
      </Link>
    );
  }

  if (isProgramsItem) {
    return (
      <div>
        <div
          className={cn(
            "flex items-center rounded-lg text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
        >
          <Link
            href={item.pathname}
            className="flex min-w-0 flex-1 items-center gap-3 px-3 py-2"
          >
            {item.icon}
            <Typography
              variant="body2"
              tagName="span"
              className="truncate text-inherit"
            >
              {item.label}
            </Typography>
          </Link>
          <button
            type="button"
            onClick={onTogglePrograms}
            className={cn(
              "mr-1 rounded-md p-1.5 transition-colors",
              isActive
                ? "hover:bg-primary-foreground/10"
                : "hover:bg-accent",
            )}
            aria-expanded={isProgramsOpen}
            aria-label={
              isProgramsOpen ? "Hide programs submenu" : "Show programs submenu"
            }
          >
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isProgramsOpen && "rotate-180",
              )}
            />
          </button>
        </div>
        {isProgramsOpen && (
          <div className="relative ml-4 mt-1 border-l border-brand-periwinkle/60 pl-3">
            <SidebarProgramList
              items={item.items}
              isLoading={item.isLoadingItems}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.pathname}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      {item.icon}
      <Typography variant="body2" tagName="span" className="text-inherit">
        {item.label}
      </Typography>
    </Link>
  );
}

interface CollapsedProgramsNavItemProps {
  item: MenuItem;
  isActive: boolean;
}

function CollapsedProgramsNavItem({
  item,
  isActive,
}: CollapsedProgramsNavItemProps) {
  const [open, setOpen] = useState(false);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimeout = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleOpen = () => {
    clearCloseTimeout();
    setOpen(true);
  };

  const handleClose = () => {
    clearCloseTimeout();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, FLYOUT_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    return () => clearCloseTimeout();
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Link
          href={item.pathname}
          className={cn(
            "flex items-center justify-center rounded-lg p-2 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
          )}
          title={item.label}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onFocus={handleOpen}
          onBlur={handleClose}
        >
          {item.icon}
          <span className="sr-only">{item.label}</span>
        </Link>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-56 p-2"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <Typography
          variant="body2"
          tagName="p"
          className="mb-1 px-2 font-semibold text-foreground"
        >
          {item.label}
        </Typography>
        <SidebarProgramList
          items={item.items}
          isLoading={item.isLoadingItems}
        />
      </PopoverContent>
    </Popover>
  );
}
