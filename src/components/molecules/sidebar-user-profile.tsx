"use client";

import { useEffect, useRef, useState } from "react";
import type { AdminProfile } from "@/lib/profile-role";
import { Typography } from "@/components/atoms/typography";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const FLYOUT_CLOSE_DELAY_MS = 150;

interface SidebarUserProfileProps {
  profile: AdminProfile;
  isCollapsed: boolean;
}

export function SidebarUserProfile({
  profile,
  isCollapsed,
}: SidebarUserProfileProps) {
  if (isCollapsed) {
    return <CollapsedSidebarUserProfile profile={profile} />;
  }

  return (
    <div className="rounded-xl border border-brand-periwinkle/60 bg-background/70 p-3 shadow-sm backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Avatar initials={profile.initials} className="h-9 w-9 text-sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">
              {profile.name}
            </p>
            <span className="shrink-0 rounded-full bg-brand-pale px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">
              Admin
            </span>
          </div>
          <p className="truncate text-xs text-muted-foreground normal-case">
            {profile.email}
          </p>
        </div>
      </div>
    </div>
  );
}

function CollapsedSidebarUserProfile({
  profile,
}: {
  profile: AdminProfile;
}) {
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
        <button
          type="button"
          className="flex w-full justify-center rounded-lg p-2 transition-colors hover:bg-accent"
          title={`${profile.name} (${profile.email})`}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          onFocus={handleOpen}
          onBlur={handleClose}
          aria-label={`${profile.name} (${profile.email})`}
        >
          <Avatar initials={profile.initials} className="h-9 w-9 text-sm" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="end"
        sideOffset={8}
        className="w-56 p-3"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
      >
        <div className="flex items-center gap-3">
          <Avatar initials={profile.initials} className="h-10 w-10 text-sm" />
          <div className="min-w-0 flex-1">
            <Typography variant="body2" tagName="p" className="truncate text-foreground">
              {profile.name}
            </Typography>
            <p className="truncate text-xs text-muted-foreground normal-case">
              {profile.email}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Avatar({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-brand-pale font-semibold text-brand-royal ring-1 ring-brand-periwinkle/60",
        className,
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}
