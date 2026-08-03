export const ATTENDANCE_STATUSES = ["present", "absent", "leave"] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave Permit",
};
