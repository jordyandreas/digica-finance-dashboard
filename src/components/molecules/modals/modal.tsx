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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
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
