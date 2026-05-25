"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/atoms/button";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  onApply?: () => void | Promise<void>;
  onCancel?: () => void;
  applyLabel?: string;
  cancelLabel?: string;
  applyDisabled?: boolean;
  applyVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  onApply,
  onCancel,
  applyLabel = "Apply",
  cancelLabel = "Cancel",
  applyDisabled = false,
  applyVariant = "default",
}: ModalProps) {
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const handleApply = async () => {
    if (onApply) {
      await onApply();
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(90vh,100dvh)] w-[calc(100%-2rem)] flex-col gap-4 p-0 sm:max-w-xl">
        <DialogHeader className="shrink-0 px-6 pt-6">
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="scrollbar-hide min-h-0 min-w-0 flex-1 overflow-y-auto px-6 py-2">
          <div className="max-w-full px-1">{children}</div>
        </div>
        <DialogFooter className="shrink-0 px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={applyVariant}
            onClick={handleApply}
            disabled={applyDisabled}
          >
            {applyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
