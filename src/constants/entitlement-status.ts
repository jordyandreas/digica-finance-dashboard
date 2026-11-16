export const ENTITLEMENT_STATUSES = ["active", "expired", "revoked"] as const;
export type EntitlementStatus = (typeof ENTITLEMENT_STATUSES)[number];

export const ENTITLEMENT_STATUS_ALL = "all" as const;

export const ENTITLEMENT_STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Expired", value: "expired" },
  { label: "Revoked", value: "revoked" },
] as const;

export const ENTITLEMENT_STATUS_FILTER_OPTIONS = [
  { label: "All statuses", value: ENTITLEMENT_STATUS_ALL },
  ...ENTITLEMENT_STATUS_OPTIONS,
] as const;

export const ENTITLEMENT_COURSE_ALL = "all" as const;
