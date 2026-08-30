"use client";

import { TextInputController } from "@/components/controllers/text-input-controller";
import { TextareaController } from "@/components/controllers/textarea-controller";
import { SelectController } from "@/components/controllers/select-controller";
import { DatePickerController } from "@/components/controllers/date-picker-controller";
import { ArticleRichTextEditor } from "@/components/molecules/article-rich-text-editor";
import { ARTICLE_CATEGORY_OPTIONS } from "@/constants/article-categories";
import type { ArticleEditorForm } from "../_hooks/use-article-editor-form";

interface ArticleFormProps {
  form: ArticleEditorForm;
  slugPreviewBase?: string;
  onSlugManualEdit?: () => void;
  autoDisplayDate: string;
  autoReadTimeMinutes: number;
}

export function ArticleForm({
  form,
  slugPreviewBase = "/articles",
  onSlugManualEdit,
  autoDisplayDate,
  autoReadTimeMinutes,
}: ArticleFormProps) {
  const slug = form.watch("slug");

  return (
    <div className="space-y-6">
      <TextInputController
        form={form}
        name="title"
        label="Title"
        required
        placeholder="Article title"
      />

      <div className="space-y-2">
        <TextInputController
          form={form}
          name="slug"
          label="Slug"
          required
          placeholder="article-slug"
          componentProps={{
            input: {
              onChange: () => {
                onSlugManualEdit?.();
              },
            },
          }}
        />
        <p className="text-sm text-muted-foreground">
          Preview:{" "}
          <span className="font-mono">
            {slugPreviewBase}/{slug || "your-slug"}
          </span>
        </p>
      </div>

      <SelectController
        form={form}
        name="category"
        label="Category"
        options={ARTICLE_CATEGORY_OPTIONS}
        placeholder="Select category"
      />

      <TextareaController
        form={form}
        name="excerpt"
        label="Excerpt"
        required
        placeholder="Short summary for cards and SEO"
        componentProps={{
          textarea: { rows: 3 },
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Body</label>
        <ArticleRichTextEditor
          value={form.watch("body_html")}
          onChange={(value) =>
            form.setValue("body_html", value, { shouldDirty: true })
          }
        />
      </div>

      <DatePickerController
        form={form}
        name="display_date"
        label="Display date"
        placeholder={autoDisplayDate || "Select date"}
        description="Optional override. Auto-filled from publish date when publishing."
      />

      <TextInputController
        form={form}
        name="read_time_minutes"
        label="Read time (minutes)"
        placeholder={String(autoReadTimeMinutes)}
        description={`Optional override. Auto-computed: ${autoReadTimeMinutes} minutes.`}
        componentProps={{
          input: {
            type: "number",
            min: 1,
            inputMode: "numeric",
          },
        }}
      />
    </div>
  );
}
