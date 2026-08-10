"use client";

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
import {
  PhoneInput,
  type PhoneInputPropsCompat,
} from "@/components/molecules/phone-input";
import { cn } from "@/lib/utils";

export interface PhoneInputControllerProps<Schema extends FieldValues> {
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
    input?: Omit<PhoneInputPropsCompat, "value" | "onChange">;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

export function PhoneInputController<Schema extends FieldValues>({
  form,
  name,
  label,
  description,
  required,
  error,
  children,
  placeholder,
  componentProps,
}: PropsWithChildren<PhoneInputControllerProps<Schema>>) {
  const {
    wrapper,
    label: labelProps,
    labelTypography,
    input,
    description: descriptionProps,
    error: errorProps,
  } = componentProps ?? {};
  const { className: wrapperClassName, ...wrapperRest } = wrapper ?? {};
  const { className: inputClassName, ...inputRest } = input ?? {};
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
        const inputId = inputRest.id ?? field.name;

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
                <label
                  htmlFor={inputId}
                  className={labelClassName}
                  {...labelRest}
                >
                  {labelChildren ?? label}
                  {required && (
                    <span className={cn("ml-1 text-destructive")}>*</span>
                  )}
                </label>
              </Typography>
            )}

            <div className="relative mt-2 min-w-0 w-full">
              <PhoneInput
                {...inputRest}
                id={inputId}
                name={field.name}
                placeholder={placeholder}
                value={typeof field.value === "string" ? field.value : ""}
                onChange={(next) => {
                  field.onChange(next);
                }}
                onBlur={field.onBlur}
                className={cn(inputClassName)}
                aria-invalid={Boolean(fieldError)}
              />
              {children}
            </div>

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
