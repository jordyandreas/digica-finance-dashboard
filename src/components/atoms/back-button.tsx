"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/atoms/button";
import { cn } from "@/lib/utils";

export function BackButton({
  onPressBack,
  href,
}: {
  onPressBack?: () => void;
  href?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const isRootPath = pathname === "/";

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onPressBack || (href ? () => router.push(href) : () => router.back())}
      className={cn("h-8 px-2", isRootPath && "hidden")}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="text-sm font-medium">Back</span>
    </Button>
  );
}
