"use client";

import { z } from "zod";

export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "on_progress",
  "failed",
  "refunded",
] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_TYPES = ["tenor", "full", "scholarship"] as const;

export type PaymentType = (typeof PAYMENT_TYPES)[number];

export const paymentSchema = z
  .object({
    participant_id: z.string().trim().min(1, "Participant is required"),
    amount: z.number(),
    payment_type: z.enum(PAYMENT_TYPES, {
      message: "Payment type is required",
    }),
    tenor: z.number().min(1).max(3).optional(),
    paid_tenor: z.number().min(1).max(3).optional(),
    status: z.enum(PAYMENT_STATUSES, {
      message: "Status is required",
    }),
    paid_at: z.string().trim().optional(),
    payment_method: z.string().trim().optional(),
    reference_name: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.payment_type === "tenor") {
        return data.tenor !== undefined && data.tenor >= 2 && data.tenor <= 3;
      }
      return true;
    },
    {
      message: "Tenor must be 2 or 3 when payment type is Tenor",
      path: ["tenor"],
    },
  )
  .refine(
    (data) => {
      if (data.payment_type === "tenor") {
        return data.paid_tenor !== undefined && data.paid_tenor >= 1;
      }
      return true;
    },
    {
      message: "Paid tenor is required when payment type is Tenor",
      path: ["paid_tenor"],
    },
  )
  .refine(
    (data) => {
      if (
        data.payment_type === "tenor" &&
        data.tenor !== undefined &&
        data.paid_tenor !== undefined
      ) {
        return data.paid_tenor <= data.tenor;
      }
      return true;
    },
    {
      message: "Paid tenor cannot exceed the selected tenor",
      path: ["paid_tenor"],
    },
  )
  .refine(
    (data) => {
      if (data.payment_type === "scholarship") {
        return data.amount >= 0;
      }
      return data.amount > 0;
    },
    {
      message: "Amount must be greater than 0",
      path: ["amount"],
    },
  );
