"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";

type FinancialVisibilityToggleProps = {
  showLabel?: boolean;
};

export function FinancialVisibilityToggle({
  showLabel = false,
}: FinancialVisibilityToggleProps) {
  const { isVisible, toggle } = useFinancialVisibility();
  const label = isVisible ? "Hide amounts" : "Show amounts";

  return (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggle}
      aria-label={label}
      title={label}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      {showLabel ? label : null}
    </Button>
  );
}
