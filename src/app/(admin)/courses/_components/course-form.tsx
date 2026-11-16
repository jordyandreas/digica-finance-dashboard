"use client";

import { TextInputController } from "@/components/controllers/text-input-controller";
import { TextareaController } from "@/components/controllers/textarea-controller";
import { SelectController } from "@/components/controllers/select-controller";
import { COURSE_LEVEL_OPTIONS } from "@/constants/course-levels";
import type { CourseEditorForm } from "../_hooks/use-course-editor-form";

interface CourseFormProps {
  form: CourseEditorForm;
  onSlugManualEdit?: () => void;
}

export function CourseForm({ form, onSlugManualEdit }: CourseFormProps) {
  const isPurchasable = form.watch("is_purchasable");

  return (
    <div className="space-y-6">
      <TextInputController
        form={form}
        name="title"
        label="Title"
        required
        placeholder="Course title"
      />

      <TextInputController
        form={form}
        name="slug"
        label="Slug"
        required
        placeholder="course-slug"
        description="Used in the learner URL. Lowercase letters, numbers, hyphens."
        componentProps={{
          input: { onChange: () => onSlugManualEdit?.() },
        }}
      />

      <TextareaController
        form={form}
        name="description"
        label="Description"
        placeholder="What learners get from this course"
        componentProps={{ textarea: { rows: 4 } }}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <SelectController
          form={form}
          name="level"
          label="Level"
          options={COURSE_LEVEL_OPTIONS}
          placeholder="Select level"
        />
        <TextInputController
          form={form}
          name="sessions"
          label="Sessions"
          placeholder="e.g. 12"
          componentProps={{
            input: { type: "number", min: 0, inputMode: "numeric" },
          }}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <TextInputController
          form={form}
          name="price_label"
          label="Price label"
          placeholder="Rp 499.000"
          description="Shown to learners."
        />
        <TextInputController
          form={form}
          name="compare_at_price_label"
          label="Compare-at price label"
          placeholder="Rp 799.000"
          description="Optional strike-through price."
        />
        <TextInputController
          form={form}
          name="price_idr"
          label="Price (IDR)"
          placeholder="499000"
          description="Numeric, for ops/WhatsApp only."
          componentProps={{
            input: { type: "number", min: 0, inputMode: "numeric" },
          }}
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-input"
          checked={isPurchasable}
          onChange={(event) =>
            form.setValue("is_purchasable", event.target.checked, {
              shouldDirty: true,
            })
          }
        />
        Purchasable (show the buy / WhatsApp CTA)
      </label>

      <TextareaController
        form={form}
        name="whatsapp_offer_message"
        label="WhatsApp offer message"
        placeholder="Hi Digica, saya mau beli course ..."
        description="Optional custom message snippet for the WhatsApp request."
        componentProps={{ textarea: { rows: 3 } }}
      />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextInputController
          form={form}
          name="instructor_name"
          label="Instructor name"
          placeholder="Instructor name"
        />
        <TextInputController
          form={form}
          name="instructor_credentials"
          label="Instructor credentials"
          placeholder="e.g. Senior Data Analyst at ..."
        />
      </div>

      <TextInputController
        form={form}
        name="instructor_avatar_url"
        label="Instructor avatar URL"
        placeholder="https://..."
      />

      <TextareaController
        form={form}
        name="outcomes"
        label="Learning outcomes"
        placeholder="One outcome per line"
        description="One outcome per line."
        componentProps={{ textarea: { rows: 5 } }}
      />
    </div>
  );
}
