"use client";

import {
  DatePickerController,
  SelectController,
  TextInputController,
} from "@/components/controllers";
import { useNumberInput } from "@/hooks/use-number-input";
import type { UseFormReturn } from "react-hook-form";

import type { ProgramFormState } from "../_hooks/use-add-program";

interface ProgramFormProps {
  form: UseFormReturn<ProgramFormState>;
}

export function ProgramForm({ form }: ProgramFormProps) {
  const { formatNumberValue, createNumberInputHandler } = useNumberInput();
  const price = form.watch("price");

  return (
    <div className="space-y-4">
      <TextInputController
        form={form}
        name="name"
        label="Name"
        required
        placeholder="Enter program name"
        componentProps={{
          input: {
            required: true,
          },
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <SelectController
          form={form}
          name="type"
          label="Type"
          placeholder="Select program type"
          options={[
            { label: "Mini Bootcamp", value: "mini_bootcamp" },
            { label: "Bootcamp", value: "bootcamp" },
            { label: "Workshop", value: "workshop" },
          ]}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "type" },
          }}
        />

        <TextInputController
          form={form}
          name="year"
          label="Year"
          required
          placeholder="e.g. 2026"
          componentProps={{
            input: {
              type: "number",
              required: true,
              min: 2000,
              max: 2100,
            },
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DatePickerController
          form={form}
          name="start_date"
          label="Start Date"
          placeholder="Pick start date"
        />

        <DatePickerController
          form={form}
          name="end_date"
          label="End Date"
          placeholder="Pick end date"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <TextInputController
          form={form}
          name="price"
          label="Price"
          required
          placeholder="Enter price"
          componentProps={{
            input: {
              type: "text",
              required: true,
              value: formatNumberValue(price),
              onChange: createNumberInputHandler(form, "price", true),
            },
          }}
        />

        <SelectController
          form={form}
          name="status"
          label="Status"
          placeholder="Select status"
          options={[
            { label: "Draft", value: "draft" },
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
          ]}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "status" },
          }}
        />
      </div>
    </div>
  );
}
