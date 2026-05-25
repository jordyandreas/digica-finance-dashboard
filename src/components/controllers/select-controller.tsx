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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";

type OptionItem = {
  label: ReactNode;
  value?: string | number | boolean;
  disabled?: boolean;
};

export interface SelectControllerProps<
  Schema extends FieldValues,
  Option extends OptionItem,
> {
  form: UseFormReturn<Schema>;
  name: FieldPath<Schema>;
  defaultValue?: HTMLAttributes<HTMLInputElement>["defaultValue"];
  label?: ReactNode;
  description?: string;
  error?: string;
  placeholder?: string;
  options?: Option[];
  componentProps?: {
    wrapper?: ComponentProps<"div">;
    label?: ComponentProps<"label">;
    labelTypography?: ComponentProps<typeof Typography>;
    select?: ComponentProps<typeof Select>;
    selectTrigger?: ComponentProps<typeof SelectTrigger>;
    selectValue?: ComponentProps<typeof SelectValue>;
    selectContent?: ComponentProps<typeof SelectContent>;
    selectItem?: Omit<ComponentProps<typeof SelectItem>, "value">;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

export function SelectController<
  Schema extends FieldValues,
  Option extends OptionItem,
>({
  form,
  name,
  label,
  description,
  error,
  children,
  placeholder,
  options = [],
  componentProps,
  defaultValue,
}: PropsWithChildren<SelectControllerProps<Schema, Option>>) {
  const {
    wrapper,
    label: labelProps,
    labelTypography,
    select,
    selectTrigger,
    selectValue,
    selectContent,
    selectItem,
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
  const { onValueChange: onValueChangeProp, ...selectRest } = select ?? {};
  const { className: selectTriggerClassName, ...selectTriggerRest } =
    selectTrigger ?? {};
  const { className: selectValueClassName, ...selectValueRest } =
    selectValue ?? {};
  const { className: selectItemClassName, ...selectItemRest } =
    selectItem ?? {};

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
        const triggerId = selectTrigger?.id ?? field.name;
        const value = String(field.value ?? defaultValue ?? "");

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
                <label htmlFor={triggerId} className={labelClassName} {...labelRest}>
                  {labelChildren ?? label}
                </label>
              </Typography>
            )}

            <div className="flex min-w-0 items-end gap-1 w-full">
              <Select
                value={value}
                onValueChange={(nextValue) => {
                  field.onChange(nextValue);
                  onValueChangeProp?.(nextValue);
                }}
                {...selectRest}
              >
                <SelectTrigger
                  id={triggerId}
                  className={cn("capitalize", selectTriggerClassName)}
                  {...selectTriggerRest}
                >
                  <SelectValue
                    placeholder={placeholder}
                    className={cn("capitalize", selectValueClassName)}
                    {...selectValueRest}
                  />
                </SelectTrigger>
                <SelectContent {...selectContent}>
                  <SelectGroup>
                    {options.map((item) => (
                      <SelectItem
                        key={`select-${field.name}-${item.value}`}
                        value={`${item.value ?? ""}`}
                        disabled={item.disabled}
                        className={cn("capitalize", selectItemClassName)}
                        {...selectItemRest}
                      >
                        {item.label}
                      </SelectItem>
                    ))}
                    {children}
                  </SelectGroup>
                </SelectContent>
              </Select>
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
