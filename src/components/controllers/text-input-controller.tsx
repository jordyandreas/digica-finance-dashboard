import {
  type ComponentProps,
  type HTMLAttributes,
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
import { cn } from "@/lib/utils";

export interface TextInputControllerProps<Schema extends FieldValues> {
  form: UseFormReturn<Schema>;
  name: FieldPath<Schema>;
  required?: boolean;
  placeholder?: string;
  defaultValue?: HTMLAttributes<HTMLInputElement>["defaultValue"];
  label?: ReactNode;
  description?: string;
  error?: string;
  componentProps?: {
    wrapper?: ComponentProps<"div">;
    label?: ComponentProps<"label">;
    labelTypography?: ComponentProps<typeof Typography>;
    input?: ComponentProps<"input">;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

const baseInputClassName =
  "mt-2 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function TextInputController<Schema extends FieldValues>({
  form,
  name,
  label,
  description,
  required,
  error,
  children,
  placeholder,
  defaultValue,
  componentProps,
}: PropsWithChildren<TextInputControllerProps<Schema>>) {
  const {
    wrapper,
    label: labelProps,
    labelTypography,
    input,
    description: descriptionProps,
    error: errorProps,
  } = componentProps ?? {};
  const { className: wrapperClassName, ...wrapperRest } = wrapper ?? {};
  const { className: inputClassName, onChange, ...inputRest } = input ?? {};
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
          <div
            className={cn("w-full", wrapperClassName)}
            {...wrapperRest}
          >
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
                    <span
                      className={cn("ml-1 text-destructive")}
                    >
                      *
                    </span>
                  )}
                </label>
              </Typography>
            )}

            <div className="flex items-end gap-1 w-full">
              <input
                {...field}
                id={inputId}
                placeholder={placeholder}
                value={field.value ?? defaultValue ?? ""}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  onChange?.(event);
                }}
                className={cn(baseInputClassName, inputClassName)}
                aria-invalid={Boolean(fieldError)}
                {...inputRest}
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
                  className={cn("mt-2 text-xs text-muted-foreground", descriptionClassName)}
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
