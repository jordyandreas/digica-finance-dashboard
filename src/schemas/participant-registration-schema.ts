import { z } from "zod";

export const registrationOccupationOptions = [
  { label: "mahasiswa", value: "mahasiswa" },
  { label: "fresh graduate", value: "fresh_graduate" },
  { label: "karyawan", value: "karyawan" },
  { label: "freelance", value: "freelance" },
  { label: "job seeker", value: "job_seeker" },
  { label: "other", value: "other" },
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

export const participantRegistrationSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Email must be valid"),
  phone: z.string().trim().min(1, "Phone number is required"),
  occupation: z
    .string()
    .trim()
    .min(1, "Occupation is required")
    .refine((value) => registrationOccupationOptionValues.includes(value as typeof registrationOccupationOptionValues[number]), {
      message: "Occupation must be one of the provided options",
    }),
  organization: z.string().trim().min(1, "Organization is required"),
});

export type ParticipantRegistrationInput = z.infer<
  typeof participantRegistrationSchema
>;
