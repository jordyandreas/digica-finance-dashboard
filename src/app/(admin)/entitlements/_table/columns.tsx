"use client";

import { RotateCcw, ShieldOff } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { StatusBadge } from "@/components/atoms/status-badge";
import { ColumnDef } from "@/components/molecules/data-table/data-table.types";
import type { LmsEntitlementListItem } from "@/services/entitlements.service";
import { formatDateTime } from "@/utils/date";

interface EntitlementsColumnsProps {
  onRevoke: (entitlement: LmsEntitlementListItem) => void;
  onReactivate: (entitlement: LmsEntitlementListItem) => void;
  pendingId?: string | null;
}

export function entitlementsColumns({
  onRevoke,
  onReactivate,
  pendingId,
}: EntitlementsColumnsProps): ColumnDef<LmsEntitlementListItem>[] {
  return [
    {
      accessorKey: "user_full_name",
      header: "Learner",
      enableSorting: true,
      cell: (item) => {
        const label =
          item.user_full_name?.trim() ||
          item.user_email?.trim() ||
          "No name";
        return (
          <div className="space-y-0.5">
            <p className="font-medium">{label}</p>
            {item.user_email ? (
              <p className="text-xs text-muted-foreground">{item.user_email}</p>
            ) : (
              <p className="font-mono text-xs text-muted-foreground">
                {item.user_id}
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "course_title",
      header: "Course",
      enableSorting: true,
      cell: (item) => item.course_title || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      enableSorting: true,
      cell: (item) => <StatusBadge status={item.status} />,
    },
    {
      accessorKey: "starts_at",
      header: "Starts",
      enableSorting: true,
      cell: (item) => formatDateTime(item.starts_at),
    },
    {
      accessorKey: "ends_at",
      header: "Ends",
      enableSorting: true,
      cell: (item) => (item.ends_at ? formatDateTime(item.ends_at) : "No expiry"),
    },
    {
      accessorKey: "notes",
      header: "Notes",
      enableSorting: false,
      cell: (item) => (
        <span className="line-clamp-2 max-w-xs text-sm text-muted-foreground">
          {item.notes || "—"}
        </span>
      ),
    },
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: (item) => (
        <div className="flex justify-end gap-1">
          {item.status === "active" ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pendingId === item.id}
              onClick={(event) => {
                event.stopPropagation();
                onRevoke(item);
              }}
            >
              <ShieldOff className="h-4 w-4 text-destructive" />
              Revoke
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={pendingId === item.id}
              onClick={(event) => {
                event.stopPropagation();
                onReactivate(item);
              }}
            >
              <RotateCcw className="h-4 w-4" />
              Reactivate
            </Button>
          )}
        </div>
      ),
    },
  ];
}
