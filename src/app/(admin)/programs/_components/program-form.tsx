"use client";

import {
  DatePickerController,
  SelectController,
  TextInputController,
} from "@/components/controllers";
import { RichTextEditor } from "@/components/molecules/rich-text-editor";
import { useNumberInput } from "@/hooks/use-number-input";
import type { UseFormReturn } from "react-hook-form";

import type { ProgramFormState } from "../_hooks/use-add-program";
import { ProgramBannerUploadField } from "./program-banner-upload-field";

interface ProgramFormProps {
  form: UseFormReturn<ProgramFormState>;
  registrationBannerFile: File | null;
  onRegistrationBannerFileChange: (file: File | null) => void;
  promoBannerFile: File | null;
  onPromoBannerFileChange: (file: File | null) => void;
}

export function ProgramForm({
  form,
  registrationBannerFile,
  onRegistrationBannerFileChange,
  promoBannerFile,
  onPromoBannerFileChange,
}: ProgramFormProps) {
  const { formatNumberValue, createNumberInputHandler } = useNumberInput();
  const price = form.watch("price");
  const programType = form.watch("type");
  const isWorkshop = programType === "workshop";

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

      <div className="space-y-2">
        <div>
          <label className="text-sm font-medium text-foreground">
            Program Benefit / Summary
          </label>
          <p className="mt-1 text-xs text-muted-foreground">
            This content will be shown below the program title on the public
            registration page.
          </p>
        </div>
        <RichTextEditor
          value={form.watch("summary_html")}
          onChange={(value) =>
            form.setValue("summary_html", value, { shouldDirty: true })
          }
          placeholder="Write the program benefits, highlights, or short summary..."
        />
      </div>

      <TextInputController
        form={form}
        name="og_image_url"
        label="Open Graph Image Path"
        placeholder="/og/fw-sql3.png"
        componentProps={{
          input: {
            id: "og_image_url",
          },
        }}
      />
      <p className="-mt-2 text-xs text-muted-foreground">
        Public path or full URL for the WhatsApp/social preview banner. Use
        og:logo separately via the Digica logo. Example: /og/fw-sql3.png
      </p>

      <ProgramBannerUploadField
        label="Registration banner"
        description="Shown on this program public registration page (workshop or mini/bootcamp)."
        value={form.watch("registration_banner_url")}
        onChange={(url) =>
          form.setValue("registration_banner_url", url, { shouldDirty: true })
        }
        pendingFile={registrationBannerFile}
        onFileSelected={onRegistrationBannerFileChange}
      />

      {isWorkshop ? (
        <ProgramBannerUploadField
          label="Promo banner"
          description="Shown on workshop check-in for the secure-seat promo."
          value={form.watch("promo_banner_url")}
          onChange={(url) =>
            form.setValue("promo_banner_url", url, { shouldDirty: true })
          }
          pendingFile={promoBannerFile}
          onFileSelected={onPromoBannerFileChange}
        />
      ) : null}

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

      <TextInputController
        form={form}
        name="batch"
        label="Batch"
        placeholder="e.g. 3"
        description="Cohort number shown as Batch N (e.g. Batch 3) in check-in success CTA when set."
        componentProps={{
          input: {
            type: "number",
            min: 1,
          },
        }}
      />

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
          name="start_time"
          label="Start Time"
          placeholder="Select start time"
          componentProps={{
            input: {
              type: "time",
            },
          }}
        />

        <TextInputController
          form={form}
          name="end_time"
          label="End Time"
          placeholder="Select end time"
          componentProps={{
            input: {
              type: "time",
            },
          }}
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

        <TextInputController
          form={form}
          name="session_count"
          label="Sessions"
          placeholder="e.g. 6"
          componentProps={{
            input: {
              type: "number",
              min: 0,
              max: 52,
            },
          }}
        />
      </div>

      {programType === "bootcamp" || programType === "mini_bootcamp" ? (
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Workshop promo prices
            </p>
            <p className="text-xs text-muted-foreground">
              Used when participants register via workshop check-in
              (`source=workshop_promo`). Social / standard registration uses the
              program Price above. Leave blank to hide that promo package.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextInputController
              form={form}
              name="promo_individual_price"
              label="Promo Individual"
              placeholder="e.g. 249000"
              componentProps={{
                input: {
                  type: "text",
                  value: formatNumberValue(
                    form.watch("promo_individual_price"),
                  ),
                  onChange: createNumberInputHandler(
                    form,
                    "promo_individual_price",
                    true,
                  ),
                },
              }}
            />
            <TextInputController
              form={form}
              name="promo_bareng_teman_price"
              label="Promo Bareng teman"
              placeholder="e.g. 199000"
              componentProps={{
                input: {
                  type: "text",
                  value: formatNumberValue(
                    form.watch("promo_bareng_teman_price"),
                  ),
                  onChange: createNumberInputHandler(
                    form,
                    "promo_bareng_teman_price",
                    true,
                  ),
                },
              }}
            />
          </div>
        </div>
      ) : null}

      <TextInputController
        form={form}
        name="public_slug"
        label="Custom Link Slug"
        placeholder="bootcamp-juli-2026"
        description="Optional. Used in your short Digica registration and check-in links (e.g. /r/bootcamp-juli-2026). Leave blank to use the auto-generated code."
        componentProps={{
          input: {
            autoCapitalize: "none",
            autoCorrect: "off",
            spellCheck: false,
          },
        }}
      />

      <TextInputController
        form={form}
        name="registration_link"
        label="Registration Link"
        placeholder="https://..."
        description="Only for external pages. Leave blank to use the short Digica link (/r/...)."
        componentProps={{
          input: {
            type: "url",
          },
        }}
      />

      {isWorkshop ? (
        <TextInputController
          form={form}
          name="bootcamp_registration_link"
          label="Mini bootcamp / Bootcamp registration link"
          placeholder="https://.../r/mini-sql-3"
          description="Shown after secure-seat yes on workshop check-in. Points to the mini/bootcamp registration URL."
          componentProps={{
            input: {
              type: "url",
            },
          }}
        />
      ) : null}

      <TextInputController
        form={form}
        name="wa_group_link"
        label="WhatsApp Group Link"
        placeholder="https://chat.whatsapp.com/..."
        description="WhatsApp group invite link shown to participants after registration."
        componentProps={{
          input: {
            type: "url",
          },
        }}
      />

      <div className="grid grid-cols-2 gap-4">
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
