"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";

const tabs = [
  { label: "Participants", segment: "participants" },
  { label: "Payments", segment: "payments" },
  { label: "Expenses", segment: "expenses" },
  { label: "Attendance", segment: "attendance" },
];

export function ProgramTabs({ programId }: { programId: string }) {
  const pathname = usePathname();
  const normalizedPathname = pathname.replace(/\/$/, "");
  const pathMatch = normalizedPathname.match(/^\/programs\/([^/]+)/);
  const resolvedProgramId =
    programId && programId !== "undefined" && programId !== "null"
      ? programId
      : pathMatch?.[1];
  const basePath = resolvedProgramId ? `/programs/${resolvedProgramId}` : "";

  return (
    <nav className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const href = basePath ? `${basePath}/${tab.segment}` : "#";
        const isActive =
          href !== "#" &&
          (normalizedPathname === href ||
            normalizedPathname.startsWith(`${href}/`));

        return (
          <Link
            key={tab.label}
            href={href}
            aria-disabled={href === "#"}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              href === "#" && "pointer-events-none opacity-60",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            <Typography variant="body2" tagName="span" className="text-inherit">
              {tab.label}
            </Typography>
          </Link>
        );
      })}
    </nav>
  );
}
