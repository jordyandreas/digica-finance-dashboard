import { z } from "zod";
import {
  isPackageKeyForSource,
  isRegistrationSource,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";
import { isValidParticipantPhone } from "@/utils/phone";

export const registrationOccupationOptions = [
  { label: "Mahasiswa", value: "mahasiswa" },
  { label: "Fresh graduate", value: "fresh_graduate" },
  { label: "Karyawan", value: "karyawan" },
  { label: "Freelance", value: "freelance" },
  { label: "Job seeker", value: "job_seeker" },
  { label: "Lainnya", value: "other" },
] as const;

const registrationOccupationOptionValues = registrationOccupationOptions.map(
  (option) => option.value,
) as [
  "mahasiswa",
  "fresh_graduate",
  "karyawan",
  "freelance",
  "job_seeker",
  "other",
];

const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone number is required")
  .refine(isValidParticipantPhone, {
    message:
      "Phone number must be a valid WhatsApp number (max 15 digits including country code)",
  });

const baseParticipantRegistrationSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email must be valid"),
  phone: phoneSchema,
  occupation: z
    .string()
    .trim()
    .min(1, "Occupation is required")
    .refine(
      (value) =>
        registrationOccupationOptionValues.includes(
          value as (typeof registrationOccupationOptionValues)[number],
        ),
      {
        message: "Occupation must be one of the provided options",
      },
    ),
  organization: z.string().trim().min(1, "Organization is required"),
});

export const participantRegistrationSchema = baseParticipantRegistrationSchema;

export const paidParticipantRegistrationSchema =
  baseParticipantRegistrationSchema
    .extend({
      registration_source: z
        .string()
        .trim()
        .min(1, "Registration source is required"),
      selected_package: z.string().trim().min(1, "Package is required"),
      friend_name: z.string().trim().optional(),
      friend_phone: z.string().trim().optional(),
    })
    .superRefine((data, ctx) => {
      if (!isRegistrationSource(data.registration_source)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Registration source is invalid",
          path: ["registration_source"],
        });
        return;
      }

      const source = data.registration_source as RegistrationSource;

      if (!isPackageKeyForSource(source, data.selected_package)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Package is invalid for this source",
          path: ["selected_package"],
        });
        return;
      }

      const selectedPackage = data.selected_package as RegistrationPackage;

      if (selectedPackage === "bareng_teman") {
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

export type ParticipantRegistrationInput = z.infer<
  typeof participantRegistrationSchema
>;

export type PaidParticipantRegistrationInput = z.infer<
  typeof paidParticipantRegistrationSchema
>;
