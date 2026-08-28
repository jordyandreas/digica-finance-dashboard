"use client";

import * as React from "react";
import {
  DatePickerController,
  PhoneInputController,
  SelectController,
  TextInputController,
  TextareaController,
} from "@/components/controllers";
import { type UseFormReturn } from "react-hook-form";
import {
  occupationOptions,
  participantSchema,
} from "@/schemas/participant-schema";
import {
  formatRegistrationPackage,
  formatRegistrationSource,
  getOffersForSource,
  isPackageKeyForSource,
  isRegistrationSource,
  type ProgramOfferPrices,
  type RegistrationPackage,
  type RegistrationSource,
} from "@/constants/registration-offers";
import { formatCurrency } from "@/utils/currency";
import { isBootcampProgram } from "@/utils/programs";
import { useProgram } from "../../_hooks/useProgram";
import { useParticipants } from "../_hooks/use-participants";

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
  notes: string;
  reference_name: string;
  program_id: string;
  registration_source: string;
  selected_package: string;
  friend_name: string;
  friend_phone: string;
};

const REGISTRATION_SOURCE_OPTIONS = [
  { label: "Not set", value: "none" },
  { label: formatRegistrationSource("workshop_promo"), value: "workshop_promo" },
  { label: formatRegistrationSource("social"), value: "social" },
] as const;

interface ParticipantFormFieldsProps {
  form: UseFormReturn<ParticipantFormState>;
  programId?: string;
  excludeParticipantId?: string;
}

export function isParticipantPackageReady(values: Pick<
  ParticipantFormState,
  "selected_package" | "friend_name" | "friend_phone"
>): boolean {
  if (values.selected_package !== "bareng_teman") {
    return true;
  }

  return (
    Boolean(values.friend_name?.trim()) && Boolean(values.friend_phone?.trim())
  );
}

export function buildParticipantPackageFields(
  values: Pick<
    ParticipantFormState,
    | "registration_source"
    | "selected_package"
    | "friend_name"
    | "friend_phone"
  >,
  offerPrices: ProgramOfferPrices,
  isPaidProgram: boolean,
):
  | {
      registration_source: RegistrationSource | null;
      selected_package: RegistrationPackage | null;
      package_price: number | null;
      friend_name: string | null;
      friend_phone: string | null;
    }
  | { error: string } {
  if (!isPaidProgram) {
    return {
      registration_source: null,
      selected_package: null,
      package_price: null,
      friend_name: null,
      friend_phone: null,
    };
  }

  const sourceValue = values.registration_source?.trim() ?? "";
  const packageValue = values.selected_package?.trim() ?? "";

  if (
    (!sourceValue || sourceValue === "none") &&
    (!packageValue || packageValue === "none")
  ) {
    return {
      registration_source: null,
      selected_package: null,
      package_price: null,
      friend_name: null,
      friend_phone: null,
    };
  }

  if (!isRegistrationSource(sourceValue)) {
    return { error: "Registration source is invalid" };
  }

  if (!packageValue || packageValue === "none") {
    return { error: "Package is required when source is set" };
  }

  if (!isPackageKeyForSource(sourceValue, packageValue)) {
    return { error: "Package is invalid for this source" };
  }

  const selectedPackage = packageValue as RegistrationPackage;
  const offers = getOffersForSource(sourceValue, offerPrices);
  const offer = offers.find((item) => item.package === selectedPackage);

  if (!offer) {
    return {
      error: "Selected package is not available. Check program offer prices.",
    };
  }

  return {
    registration_source: sourceValue,
    selected_package: selectedPackage,
    package_price: offer.price,
    friend_name:
      selectedPackage === "bareng_teman"
        ? values.friend_name?.trim().toLowerCase() || null
        : null,
    friend_phone:
      selectedPackage === "bareng_teman"
        ? values.friend_phone?.trim() || null
        : null,
  };
}

export function ParticipantFormFields({
  form,
  programId = "",
  excludeParticipantId,
}: ParticipantFormFieldsProps) {
  const { data: program } = useProgram(programId);
  const { data: participants = [], isLoading: isParticipantsLoading } =
    useParticipants(programId);

  const showPackageFields = isBootcampProgram(program?.type);
  const registrationSource = form.watch("registration_source");
  const selectedPackage = form.watch("selected_package");
  const isBarengTeman = selectedPackage === "bareng_teman";

  const offerPrices = React.useMemo<ProgramOfferPrices>(
    () => ({
      promo_individual_price: program?.promo_individual_price ?? null,
      promo_bareng_teman_price: program?.promo_bareng_teman_price ?? null,
      price: program?.price ?? null,
    }),
    [
      program?.price,
      program?.promo_bareng_teman_price,
      program?.promo_individual_price,
    ],
  );

  const resolvedSource = isRegistrationSource(registrationSource)
    ? registrationSource
    : null;

  const packageOffers = React.useMemo(
    () => (resolvedSource ? getOffersForSource(resolvedSource, offerPrices) : []),
    [offerPrices, resolvedSource],
  );

  const packageOptions = [
    { label: "Not set", value: "none" },
    ...packageOffers.map((offer) => ({
      label: `${formatRegistrationPackage(offer.package)} (${formatCurrency(offer.price)})`,
      value: offer.package,
    })),
  ];

  React.useEffect(() => {
    if (!showPackageFields || !resolvedSource) {
      return;
    }

    const currentPackage = form.getValues("selected_package");
    if (
      currentPackage &&
      currentPackage !== "none" &&
      !isPackageKeyForSource(resolvedSource, currentPackage)
    ) {
      form.setValue("selected_package", "none", { shouldDirty: true });
      form.setValue("friend_name", "", { shouldDirty: true });
      form.setValue("friend_phone", "", { shouldDirty: true });
    }
  }, [form, resolvedSource, showPackageFields]);

  React.useEffect(() => {
    if (!isBarengTeman) {
      const friendName = form.getValues("friend_name");
      const friendPhone = form.getValues("friend_phone");
      if (friendName || friendPhone) {
        form.setValue("friend_name", "", { shouldDirty: true });
        form.setValue("friend_phone", "", { shouldDirty: true });
      }
    }
  }, [form, isBarengTeman]);

  const referralParticipants = participants.filter(
    (participant) => participant.id !== excludeParticipantId,
  );

  const referralOptions = [
    { label: "No referral", value: "none" },
    ...referralParticipants.map((participant) => ({
      label: participant.name || "Unnamed participant",
      value: participant.id,
    })),
  ];

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
        <PhoneInputController
          form={form}
          name="phone"
          label="Phone"
          required
          placeholder="812 3456 7890"
          description="Select country code, then enter the number without +62 or leading 0."
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
      </div>

      {showPackageFields ? (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Package</p>
            <p className="text-xs text-muted-foreground">
              Registration source and package type for this participant.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectController
              form={form}
              name="registration_source"
              label="Source"
              placeholder="Select source"
              options={[...REGISTRATION_SOURCE_OPTIONS]}
              componentProps={{
                selectTrigger: { className: "mt-2", id: "registration_source" },
                select: {
                  onValueChange: (value) => {
                    if (value === "none") {
                      form.setValue("registration_source", "none", {
                        shouldDirty: true,
                      });
                      form.setValue("selected_package", "none", {
                        shouldDirty: true,
                      });
                      form.setValue("friend_name", "", { shouldDirty: true });
                      form.setValue("friend_phone", "", { shouldDirty: true });
                      return;
                    }

                    form.setValue("registration_source", value, {
                      shouldDirty: true,
                    });
                  },
                },
              }}
            />

            <SelectController
              form={form}
              name="selected_package"
              label="Package type"
              placeholder={
                resolvedSource ? "Select package" : "Select source first"
              }
              options={packageOptions}
              componentProps={{
                selectTrigger: { className: "mt-2", id: "selected_package" },
                select: {
                  disabled: !resolvedSource,
                  onValueChange: (value) => {
                    if (value === "none") {
                      form.setValue("selected_package", "none", {
                        shouldDirty: true,
                      });
                      form.setValue("friend_name", "", { shouldDirty: true });
                      form.setValue("friend_phone", "", { shouldDirty: true });
                      return;
                    }

                    form.setValue("selected_package", value, {
                      shouldDirty: true,
                    });
                  },
                },
              }}
            />
          </div>

          {resolvedSource && packageOffers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No packages are configured for this source. Set offer prices on the
              program first.
            </p>
          ) : null}

          {isBarengTeman ? (
            <div className="grid grid-cols-2 gap-4">
              <TextInputController
                form={form}
                name="friend_name"
                label="Friend name"
                required
                placeholder="Friend joining with participant"
                componentProps={{
                  input: {
                    className: "capitalize",
                  },
                }}
              />
              <PhoneInputController
                form={form}
                name="friend_phone"
                label="Friend WhatsApp"
                required
                placeholder="812 3456 7890"
                description="Friend's WhatsApp number."
              />
            </div>
          ) : null}
        </div>
      ) : null}

      <SelectController
        form={form}
        name="reference_name"
        label="Referral"
        searchable
        searchPlaceholder="Search referral..."
        placeholder={
          isParticipantsLoading ? "Loading participants..." : "Select referral"
        }
        options={referralOptions}
        componentProps={{
          selectTrigger: { className: "mt-2", id: "reference_name" },
          select: {
            disabled: isParticipantsLoading,
          },
        }}
      />

      <TextareaController
        form={form}
        name="notes"
        label="Notes"
        placeholder="Optional notes"
      />
    </div>
  );
}
