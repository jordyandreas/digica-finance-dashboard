"use client";

import { DataTable } from "@/components/molecules/data-table";
import type { LmsEntitlementListItem } from "@/services/entitlements.service";
import { entitlementsColumns } from "./columns";

interface EntitlementsTableProps {
  data: LmsEntitlementListItem[];
  onRevoke: (entitlement: LmsEntitlementListItem) => void;
  onReactivate: (entitlement: LmsEntitlementListItem) => void;
  pendingId?: string | null;
}

export function EntitlementsTable({
  data,
  onRevoke,
  onReactivate,
  pendingId,
}: EntitlementsTableProps) {
  const columns = entitlementsColumns({ onRevoke, onReactivate, pendingId });

  return (
    <DataTable
      data={data}
      columns={columns}
      keyExtractor={(item) => item.id}
    />
  );
}
