import {
  type ComponentProps,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";

import { Typography } from "@/components/atoms/typography";
import { DatePicker } from "@/components/ui/date-picker";
import { cn } from "@/lib/utils";

export interface DatePickerControllerProps<Schema extends FieldValues> {
  form: UseFormReturn<Schema>;
  name: FieldPath<Schema>;
  required?: boolean;
  placeholder?: string;
  label?: ReactNode;
  description?: string;
  error?: string;
  componentProps?: {
    wrapper?: ComponentProps<"div">;
    label?: ComponentProps<"label">;
    labelTypography?: ComponentProps<typeof Typography>;
    datePicker?: ComponentProps<typeof DatePicker>;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

export function DatePickerController<Schema extends FieldValues>({
  form,
  name,
  label,
  description,
  required,
  error,
  placeholder,
  componentProps,
}: PropsWithChildren<DatePickerControllerProps<Schema>>) {
  const {
    wrapper,
    label: labelProps,
    labelTypography,
    datePicker,
    description: descriptionProps,
    error: errorProps,
  } = componentProps ?? {};
  const { className: wrapperClassName, ...wrapperRest } = wrapper ?? {};
  const {
    className: labelClassName,
    children: labelChildren,
    ...labelRest
  } = labelProps ?? {};
  const { className: labelTypographyClassName, ...labelTypographyRest } =
    labelTypography ?? {};
  const { className: descriptionClassName, ...descriptionRest } =
    descriptionProps ?? {};
  const { className: errorClassName, ...errorRest } = errorProps ?? {};
  const {
    className: datePickerClassName,
    onChange,
    id: datePickerId,
    ...datePickerRest
  } = datePicker ?? {};

  return (
    <Controller
      control={form.control}
      name={name}
      render={({
        field,
        fieldState,
      }: {
        field: ControllerRenderProps<Schema, FieldPath<Schema>>;
        fieldState: ControllerFieldState;
      }) => {
        const fieldError = error ?? fieldState.error?.message;
        const inputId = datePickerId ?? field.name;

        return (
          <div className={cn("w-full", wrapperClassName)} {...wrapperRest}>
            {label && (
              <Typography
                variant="label"
                asChild
                className={cn(
                  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                  labelTypographyClassName,
                )}
                {...labelTypographyRest}
              >
                <label htmlFor={inputId} className={labelClassName} {...labelRest}>
                  {labelChildren ?? label}
                  {required && (
                    <span className={cn("ml-1 text-destructive")}>*</span>
                  )}
                </label>
              </Typography>
            )}

            <DatePicker
              id={inputId}
              value={field.value ?? ""}
              placeholder={placeholder}
              onChange={(nextValue) => {
                field.onChange(nextValue);
                onChange?.(nextValue);
              }}
              className={cn("mt-2", datePickerClassName)}
              {...datePickerRest}
            />

            {fieldError ? (
              <p
                className={cn("mt-2 text-xs text-destructive", errorClassName)}
                {...errorRest}
              >
                {fieldError}
              </p>
            ) : (
              description && (
                <p
                  className={cn(
                    "mt-2 text-xs text-muted-foreground",
                    descriptionClassName,
                  )}
                  {...descriptionRest}
                >
                  {description}
                </p>
              )
            )}
          </div>
        );
      }}
    />
  );
}
