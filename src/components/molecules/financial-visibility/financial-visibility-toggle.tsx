"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";

export function FinancialVisibilityToggle() {
  const { isVisible, toggle } = useFinancialVisibility();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={
        isVisible ? "Hide financial amounts" : "Show financial amounts"
      }
      title={isVisible ? "Hide financial amounts" : "Show financial amounts"}
    >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  );
}
