"use client";

import {
  DatePickerController,
  SelectController,
  TextInputController,
} from "@/components/controllers";
import { type UseFormReturn } from "react-hook-form";
import {
  occupationOptions,
  participantSchema,
} from "@/schemas/participant-schema";

export { participantSchema };

export type ParticipantFormState = {
  name: string;
  email: string;
  phone: string;
  occupation: string;
  organization: string;
  status: string;
  payment_status: string;
  joined_date: string;
  program_id: string;
};

interface ParticipantFormFieldsProps {
  form: UseFormReturn<ParticipantFormState>;
}

export function ParticipantFormFields({ form }: ParticipantFormFieldsProps) {
  return (
    <div className="space-y-4">
      <TextInputController
        form={form}
        name="name"
        label="Name"
        required
        placeholder="Enter participant name"
        componentProps={{
          input: {
            className: "capitalize",
            required: true,
          },
        }}
      />

      <div className="grid grid-cols-2 gap-4">
        <TextInputController
          form={form}
          name="email"
          label="Email"
          required
          placeholder="name@example.com"
          componentProps={{
            input: {
              type: "email",
              required: true,
            },
          }}
        />
        <TextInputController
          form={form}
          name="phone"
          label="Phone"
          required
          placeholder="+62 812 000 0000"
          componentProps={{
            input: {
              type: "tel",
              required: true,
            },
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectController
          form={form}
          name="occupation"
          label="Occupation"
          placeholder="Select occupation"
          options={[{ label: "Not set", value: "none" }, ...occupationOptions]}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "occupation" },
            select: {
              onValueChange: (value) => {
                if (value === "none") {
                  form.setValue("occupation", "", { shouldDirty: true });
                }
              },
            },
          }}
        />
        <TextInputController
          form={form}
          name="organization"
          label="Organization"
          placeholder="Organization"
          componentProps={{
            input: {
              className: "uppercase",
            },
          }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <SelectController
          form={form}
          name="status"
          label="Status"
          placeholder="Select status"
          options={[
            { label: "Active", value: "active" },
            { label: "Completed", value: "completed" },
            { label: "Dropout", value: "dropout" },
          ]}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "status" },
          }}
        />
        <DatePickerController
          form={form}
          name="joined_date"
          label="Joined Date"
          required
          placeholder="Pick joined date"
        />
        {/* <SelectController
          form={form}
          name="payment_status"
          label="Payment Status"
          placeholder="Select payment status"
          options={[
            { label: "Pending", value: "pending" },
            { label: "Paid", value: "paid" },
            { label: "Refunded", value: "refunded" },
          ]}
          componentProps={{
            selectTrigger: { className: "mt-2", id: "payment_status" },
          }}
        /> */}
      </div>
    </div>
  );
}
