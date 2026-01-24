"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/atoms/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTablePaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

export const DEFAULT_PAGE_SIZE = 10;

const MAX_PAGE_BUTTONS = 5;

export const PAGE_SIZE = [5, 10, 20, 50];

export function DataTablePaginationControl({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: DataTablePaginationControlProps) {
  const displayTotalPages = totalPages || 1;

  return (
    <div className="flex items-center justify-between px-4 py-4">
      <div className="text-sm text-muted-foreground">
        <span>Page</span>{" "}
        <span className="text-foreground">{currentPage}</span>{" "}
        <span>of</span>{" "}
        <span className="text-foreground">{displayTotalPages}</span>
      </div>

      {displayTotalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({
              length: Math.min(MAX_PAGE_BUTTONS, displayTotalPages),
            }).map(
              (_, i) => {
                const pageNumber = i + 1;
                const isCurrentPage = currentPage === pageNumber;
                return (
                  <Button
                    key={i}
                    size="sm"
                    variant="outline"
                    disabled={isCurrentPage}
                    className={cn(
                      "w-8 h-8",
                      isCurrentPage
                        ? "bg-muted text-foreground"
                        : "bg-background text-muted-foreground",
                    )}
                    onClick={() => onPageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                );
              },
            )}
            {displayTotalPages > MAX_PAGE_BUTTONS && (
              <>
                <span className="px-2">...</span>
                {currentPage > MAX_PAGE_BUTTONS &&
                  currentPage < displayTotalPages && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled
                      className="w-8 h-8 bg-muted text-foreground"
                    >
                      {currentPage}
                    </Button>
                    <span className="px-2">...</span>
                  </>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-8 h-8 bg-transparent"
                  disabled={displayTotalPages === currentPage}
                  onClick={() => onPageChange(displayTotalPages)}
                >
                  {displayTotalPages}
                </Button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= displayTotalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {pageSize !== undefined && onPageSizeChange && (
        <div className="flex items-center gap-2">
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => {
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className="lowercase">
              <SelectValue>
                {pageSize}/page
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE.map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
}
