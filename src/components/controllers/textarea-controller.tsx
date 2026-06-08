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
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TextareaControllerProps<Schema extends FieldValues> {
  form: UseFormReturn<Schema>;
  name: FieldPath<Schema>;
  required?: boolean;
  placeholder?: string;
  defaultValue?: HTMLAttributes<HTMLTextAreaElement>["defaultValue"];
  label?: ReactNode;
  description?: string;
  error?: string;
  componentProps?: {
    wrapper?: ComponentProps<"div">;
    label?: ComponentProps<"label">;
    labelTypography?: ComponentProps<typeof Typography>;
    textarea?: ComponentProps<"textarea">;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

export function TextareaController<Schema extends FieldValues>({
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
}: PropsWithChildren<TextareaControllerProps<Schema>>) {
  const {
    wrapper,
    label: labelProps,
    labelTypography,
    textarea,
    description: descriptionProps,
    error: errorProps,
  } = componentProps ?? {};
  const { className: wrapperClassName, ...wrapperRest } = wrapper ?? {};
  const { className: textareaClassName, onChange, ...textareaRest } =
    textarea ?? {};
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
        const textareaId = textareaRest.id ?? field.name;

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
                  htmlFor={textareaId}
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

            <div className="mt-2 flex min-w-0 w-full items-end gap-1">
              <Textarea
                {...field}
                id={textareaId}
                placeholder={placeholder}
                value={field.value ?? defaultValue ?? ""}
                onChange={(event) => {
                  field.onChange(event.target.value);
                  onChange?.(event);
                }}
                className={textareaClassName}
                aria-invalid={Boolean(fieldError)}
                {...textareaRest}
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
