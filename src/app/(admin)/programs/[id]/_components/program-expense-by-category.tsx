"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMaskedCurrency } from "@/components/molecules/financial-visibility";
import { InfoPopover } from "@/components/molecules/info-popover";
import { useFinancialVisibility } from "@/hooks/use-financial-visibility";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/date";
import type { ExpenseCategoryDetailItem } from "@/services/expenses.service";
import { useExpensesCategorySummary } from "../expenses/_hooks/useExpenses";

type ProgramExpenseByCategoryProps = {
  programId: string;
};

export function ProgramExpenseByCategory({
  programId,
}: ProgramExpenseByCategoryProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { data, error, isLoading } = useExpensesCategorySummary(programId);
  const { isVisible } = useFinancialVisibility();
  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalAmount = data?.totalAmount ?? 0;

  return (
    <Card>
      <CardHeader className={cn("space-y-0", !isOpen && "pb-6")}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className="flex w-full items-center justify-between rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <CardTitle className="text-xl font-semibold leading-none tracking-tight">
            Expense by category
            {!isLoading && !error && totalCount > 0 ? (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalCount} · {formatMaskedCurrency(totalAmount, isVisible)})
              </span>
            ) : null}
          </CardTitle>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {isOpen ? (
        <CardContent>
          {error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Failed to load expense breakdown"}
            </p>
          ) : isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={`expense-cat-skeleton-${index}`}
                  className="h-8 animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No expenses recorded for this program yet.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-3 border-b pb-3">
                <p className="text-sm text-muted-foreground">
                  {totalCount} expense{totalCount !== 1 ? "s" : ""}
                </p>
                <p className="text-lg font-semibold tabular-nums text-red-700">
                  {formatMaskedCurrency(totalAmount, isVisible)}
                </p>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.category}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="inline-flex items-center gap-1.5 font-medium">
                        <span>{item.label}</span>
                        {item.items.length > 0 ? (
                          <InfoPopover
                            title={`${item.label} · ${item.count}`}
                            triggerLabel={`Show ${item.label} details`}
                          >
                            <ExpenseCategoryItemsList
                              items={item.items}
                              isVisible={isVisible}
                            />
                          </InfoPopover>
                        ) : null}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.count} item{item.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <p className="shrink-0 font-medium tabular-nums text-red-700">
                      {formatMaskedCurrency(item.amount, isVisible)}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      ) : null}
    </Card>
  );
}

function ExpenseCategoryItemsList({
  items,
  isVisible,
}: {
  items: ExpenseCategoryDetailItem[];
  isVisible: boolean;
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const description = item.description?.trim();
        return (
          <li
            key={item.id}
            className="flex items-start justify-between gap-3 rounded-md px-1 py-0.5 text-sm"
          >
            <div className="min-w-0">
              <p className="leading-snug text-foreground">
                {description || "No description"}
              </p>
              {item.expenseDate ? (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {formatDate(item.expenseDate)}
                </p>
              ) : null}
            </div>
            <p className="shrink-0 tabular-nums font-medium text-red-700">
              {formatMaskedCurrency(item.amount, isVisible)}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
