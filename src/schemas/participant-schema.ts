"use client";

import { z } from "zod";
import {
  isPackageKeyForSource,
  isRegistrationSource,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";
import { isValidParticipantPhone } from "@/utils/phone";

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
  phone: z
    .string()
    .trim()
    .min(1, "Phone is required")
    .refine(isValidParticipantPhone, {
      message:
        "Phone number must be a valid WhatsApp number (max 15 digits including country code)",
    }),
  occupation: z
    .enum(occupationOptionValues, {
      message: "Occupation must be one of the provided options",
    })
    .optional()
    .or(z.literal("")),
  organization: z.string().trim().optional(),
  joined_date: z.string().trim().min(1, "Joined date is required"),
  notes: z.string().trim().optional(),
  reference_name: z.string().trim().optional(),
  registration_source: z.string().trim().optional(),
  selected_package: z.string().trim().optional(),
  friend_name: z.string().trim().optional(),
  friend_phone: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  const source = data.registration_source?.trim() ?? "";
  const selectedPackage = data.selected_package?.trim() ?? "";

  if (!source && !selectedPackage) {
    return;
  }

  if (source && !selectedPackage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Package is required when source is set",
      path: ["selected_package"],
    });
    return;
  }

  if (!source && selectedPackage) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Source is required when package is set",
      path: ["registration_source"],
    });
    return;
  }

  if (!isRegistrationSource(source)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Registration source is invalid",
      path: ["registration_source"],
    });
    return;
  }

  const registrationSource = source as RegistrationSource;

  if (!isPackageKeyForSource(registrationSource, selectedPackage)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Package is invalid for this source",
      path: ["selected_package"],
    });
    return;
  }

  const packageType = selectedPackage as RegistrationPackage;

  if (packageType === "bareng_teman") {
    if (!data.friend_name?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Friend name is required for Bareng teman package",
        path: ["friend_name"],
      });
    }
    if (!data.friend_phone?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Friend phone is required for Bareng teman package",
        path: ["friend_phone"],
      });
    } else if (!isValidParticipantPhone(data.friend_phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Friend phone must be a valid WhatsApp number (max 15 digits including country code)",
        path: ["friend_phone"],
      });
    }
  }
});
