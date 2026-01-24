"use client";

import { z } from "zod";

export const paymentSchema = z
  .object({
    participant_id: z.string().trim().min(1, "Participant is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    payment_type: z.enum(["tenor", "full"], {
      message: "Payment type is required",
    }),
    tenor: z.number().min(1).max(3).optional(),
    status: z.string().trim().min(1, "Status is required"),
    paid_at: z.string().trim().optional(),
    payment_method: z.string().trim().optional(),
    reference_name: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_type === "tenor") {
        return data.tenor !== undefined && data.tenor >= 1 && data.tenor <= 3;
      }
      return true;
    },
    {
      message: "Tenor must be between 2 and 3 when payment type is Tenor",
      path: ["tenor"],
    },
  );
