"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

interface ProgramBannerUploadFieldProps {
  label: string;
  description?: string;
  value: string;
  onChange: (url: string) => void;
  onFileSelected: (file: File | null) => void;
  pendingFile: File | null;
  disabled?: boolean;
}

export function ProgramBannerUploadField({
  label,
  description,
  value,
  onChange,
  onFileSelected,
  pendingFile,
  disabled = false,
}: ProgramBannerUploadFieldProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewUrl = React.useMemo(() => {
    if (pendingFile) {
      return URL.createObjectURL(pendingFile);
    }
    return value.trim() || null;
  }, [pendingFile, value]);

  React.useEffect(() => {
    if (!pendingFile || !previewUrl) {
      return;
    }

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [pendingFile, previewUrl]);

  const handleClear = () => {
    onFileSelected(null);
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <label className="text-sm font-medium text-foreground">{label}</label>
        {description ? (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>

      {previewUrl ? (
        <div className="overflow-hidden rounded-xl border bg-muted/20">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt={`${label} preview`}
            className="h-auto w-full object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            "flex h-28 items-center justify-center rounded-xl border border-dashed bg-muted/10 text-xs text-muted-foreground",
          )}
        >
          No banner selected
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif"
          className="hidden"
          disabled={disabled}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            onFileSelected(file);
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {previewUrl ? "Replace image" : "Upload image"}
        </Button>
        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={handleClear}
          >
            Remove
          </Button>
        ) : null}
      </div>
    </div>
  );
}
