export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "leave",
  "recording",
] as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  leave: "Leave Permit",
  recording: "Watched Recording",
};

const RECORDING_ATTENDANCE_PROGRAM_TYPES = ["mini_bootcamp", "bootcamp"] as const;

export function supportsRecordingAttendance(
  programType: string | null | undefined,
): boolean {
  return RECORDING_ATTENDANCE_PROGRAM_TYPES.some((type) => type === programType);
}
