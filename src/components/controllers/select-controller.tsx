"use client";

import {
  type ComponentProps,
  type HTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Controller,
  type ControllerFieldState,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import { Check, ChevronDown, Search, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Typography } from "@/components/atoms/typography";
import { cn } from "@/lib/utils";

type OptionItem = {
  label: ReactNode;
  value?: string | number | boolean;
  disabled?: boolean;
  searchLabel?: string;
};

function getOptionSearchText(item: OptionItem): string {
  if (item.searchLabel) {
    return item.searchLabel;
  }

  if (typeof item.label === "string") {
    return item.label;
  }

  return String(item.value ?? "");
}

const searchInputClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

const selectTriggerClassName =
  "flex h-9 w-full min-w-0 items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

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
  searchable?: boolean;
  searchPlaceholder?: string;
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
    searchInput?: ComponentProps<"input">;
    description?: ComponentProps<"p">;
    error?: ComponentProps<"p">;
  };
}

interface SearchableSelectFieldProps<Option extends OptionItem> {
  triggerId: string;
  value: string;
  placeholder?: string;
  searchPlaceholder: string;
  options: Option[];
  disabled?: boolean;
  triggerClassName?: string;
  itemClassName?: string;
  searchInputProps?: ComponentProps<"input">;
  onChange: (value: string) => void;
}

function SearchableSelectField<Option extends OptionItem>({
  triggerId,
  value,
  placeholder,
  searchPlaceholder,
  options,
  disabled,
  triggerClassName,
  itemClassName,
  searchInputProps,
  onChange,
}: SearchableSelectFieldProps<Option>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { className: searchInputClassNameProp, ...searchInputRest } =
    searchInputProps ?? {};

  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return options;
    }

    return options.filter((item) =>
      getOptionSearchText(item).toLowerCase().includes(query),
    );
  }, [options, searchQuery]);

  const selectedOption = options.find(
    (item) => String(item.value ?? "") === value,
  );

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchQuery("");
    }

    setIsOpen(nextOpen);
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal={false}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={triggerId}
          disabled={disabled}
          className={cn(selectTriggerClassName, triggerClassName)}
        >
          <span
            className={cn(
              "line-clamp-1 text-left capitalize",
              selectedOption ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {selectedOption?.label ?? placeholder}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) gap-0 p-0"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder={searchPlaceholder}
              autoComplete="off"
              className={cn(
                searchInputClassName,
                "pl-9",
                searchQuery ? "pr-9" : undefined,
                searchInputClassNameProp,
              )}
              {...searchInputRest}
            />
            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-2 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto p-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((item) => {
              const itemValue = String(item.value ?? "");
              const isSelected = itemValue === value;

              return (
                <button
                  key={`searchable-select-${itemValue}`}
                  type="button"
                  disabled={item.disabled}
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-left text-sm capitalize outline-none hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
                    isSelected && "bg-accent text-accent-foreground",
                    itemClassName,
                  )}
                  onClick={() => {
                    onChange(itemValue);
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected ? <Check className="h-4 w-4" /> : null}
                  </span>
                  {item.label}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No results found
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
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
  searchable = false,
  searchPlaceholder = "Search...",
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
    searchInput,
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
    onValueChange: onValueChangeProp,
    disabled: selectDisabled,
    ...selectRest
  } = select ?? {};
  const {
    className: selectTriggerClassNameProp,
    disabled: selectTriggerDisabled,
    ...selectTriggerRest
  } = selectTrigger ?? {};
  const { className: selectValueClassName, ...selectValueRest } =
    selectValue ?? {};
  const { className: selectItemClassName, ...selectItemRest } =
    selectItem ?? {};

  const isDisabled = selectDisabled || selectTriggerDisabled;

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

        const handleValueChange = (nextValue: string) => {
          field.onChange(nextValue);
          onValueChangeProp?.(nextValue);
        };

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
              {searchable ? (
                <SearchableSelectField
                  triggerId={triggerId}
                  value={value}
                  placeholder={placeholder}
                  searchPlaceholder={searchPlaceholder}
                  options={options}
                  disabled={isDisabled}
                  triggerClassName={selectTriggerClassNameProp}
                  itemClassName={selectItemClassName}
                  searchInputProps={searchInput}
                  onChange={handleValueChange}
                />
              ) : (
                <Select
                  value={value || undefined}
                  onValueChange={handleValueChange}
                  disabled={isDisabled}
                  {...selectRest}
                >
                  <SelectTrigger
                    id={triggerId}
                    className={cn("capitalize", selectTriggerClassNameProp)}
                    disabled={isDisabled}
                    {...selectTriggerRest}
                  >
                    {value ? (
                      <SelectValue
                        placeholder={placeholder}
                        className={cn("capitalize", selectValueClassName)}
                        {...selectValueRest}
                      />
                    ) : (
                      <span
                        className={cn(
                          "capitalize text-muted-foreground",
                          selectValueClassName,
                        )}
                      >
                        {placeholder}
                      </span>
                    )}
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
              )}
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
