"use client";

import { type Path, type UseFormReturn } from "react-hook-form";

import { formatNumber } from "@/utils/number";

/**
 * Hook for handling number inputs with comma formatting
 * Provides utilities for formatting numbers with thousand separators
 * and handling input changes that strip non-digit characters
 */
export function useNumberInput() {
  /**
   * Formats a number value for display with thousand separators
   * @param value - The number value to format (can be undefined or null)
   * @returns Formatted string with commas, or empty string if value is undefined/null
   *
   * @example
   * formatNumberValue(1000) // "1,000"
   * formatNumberValue(1000000) // "1,000,000"
   * formatNumberValue(undefined) // ""
   */
  const formatNumberValue = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return "";
    return formatNumber(value);
  };

  /**
   * Creates a number input change handler for React Hook Form
   * Strips all non-digit characters and updates the form field with the numeric value
   * @param form - The React Hook Form instance
   * @param fieldName - The name of the form field to update
   * @param allowUndefined - Whether to allow undefined values (default: false)
   * @returns A change event handler function
   *
   * @example
   * const handler = createNumberInputHandler(form, "amount");
   * <input onChange={handler} />
   */
  const createNumberInputHandler = <
    TFieldValues extends Record<string, unknown>,
  >(
    form: UseFormReturn<TFieldValues>,
    fieldName: Path<TFieldValues>,
    allowUndefined: boolean = false,
  ) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = event.target.value;
      // Remove all non-digit characters except for empty string
      const cleanedValue = inputValue.replace(/[^\d]/g, "");

      if (cleanedValue === "") {
        if (allowUndefined) {
          // Use type assertion to allow undefined for optional number fields
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setValue(fieldName, undefined as any, {
            shouldValidate: true,
          });
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          form.setValue(fieldName, 0 as any, {
            shouldValidate: true,
          });
        }
        return;
      }

      // Convert to number and set the value (without commas for storage)
      const numValue = Number(cleanedValue);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      form.setValue(fieldName, numValue as any, {
        shouldValidate: true,
      });
    };
  };

  return {
    formatNumberValue,
    createNumberInputHandler,
  };
}
