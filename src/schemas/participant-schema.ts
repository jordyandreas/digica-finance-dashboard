"use client";

import { z } from "zod";

export const occupationOptions = [
  { label: "mahasiswa", value: "mahasiswa" },
  { label: "fresh graduate", value: "fresh_graduate" },
  { label: "karyawan", value: "karyawan" },
  { label: "freelance", value: "freelance" },
  { label: "job seeker", value: "job_seeker" },
  { label: "other", value: "other" },
] as const;

export const occupationOptionValues = [
  "mahasiswa",
  "fresh_graduate",
  "karyawan",
  "freelance",
  "job_seeker",
  "other",
] as const;

export const participantSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email must be valid"),
  phone: z.string().trim().min(1, "Phone is required"),
  occupation: z
    .enum(occupationOptionValues, {
      message: "Occupation must be one of the provided options",
    })
    .optional()
    .or(z.literal("")),
  organization: z.string().trim().optional(),
  joined_date: z.string().trim().min(1, "Joined date is required"),
});
