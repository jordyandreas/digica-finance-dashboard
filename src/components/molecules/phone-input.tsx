"use client";

import * as React from "react";
import { ChevronDown, Search, X } from "lucide-react";
import PhoneInputWithCountry, {
  type Country,
  type Props as PhoneInputProps,
  type Value as E164Number,
} from "react-phone-number-input";
import { getCountryCallingCode } from "libphonenumber-js";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DEFAULT_PHONE_COUNTRY } from "@/utils/phone";

import "react-phone-number-input/style.css";

type CountrySelectOption = {
  value?: Country;
  label: string;
  divider?: boolean;
};

type PreparedCountryOption = {
  value: Country;
  label: string;
  dialCode: string;
  searchText: string;
};

type CountrySelectProps = {
  value?: Country;
  onChange: (value: Country | undefined) => void;
  options: CountrySelectOption[];
  iconComponent: React.ElementType;
  disabled?: boolean;
  readOnly?: boolean;
  className?: string;
  name?: string;
  onFocus?: React.FocusEventHandler<HTMLElement>;
  onBlur?: React.FocusEventHandler<HTMLElement>;
};

const searchInputClassName =
  "flex h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

function CountrySelect({
  value,
  onChange,
  options,
  iconComponent: Icon,
  disabled,
  readOnly,
  onFocus,
  onBlur,
}: CountrySelectProps) {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  const countryOptions = React.useMemo<PreparedCountryOption[]>(() => {
    const prepared: PreparedCountryOption[] = [];

    for (const option of options) {
      if (option.divider || !option.value) {
        continue;
      }

      const dialCode = getCountryCallingCode(option.value);
      prepared.push({
        value: option.value,
        label: option.label,
        dialCode,
        searchText:
          `${option.label} ${option.value} +${dialCode} ${dialCode}`.toLowerCase(),
      });
    }

    return prepared;
  }, [options]);

  const filteredOptions = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return countryOptions;
    }

    return countryOptions.filter((option) => option.searchText.includes(query));
  }, [countryOptions, searchQuery]);

  const selected = countryOptions.find((option) => option.value === value);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSearchQuery("");
    }
    setIsOpen(nextOpen);
  };

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    return () => cancelAnimationFrame(frameId);
  }, [isOpen]);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} modal>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || readOnly}
          onFocus={onFocus}
          onBlur={onBlur}
          aria-label={
            selected
              ? `${selected.label} +${selected.dialCode}`
              : "Select country"
          }
          className={cn(
            "PhoneInputCountry flex h-full shrink-0 items-center gap-1.5 rounded-sm px-1 text-sm outline-none transition-colors hover:bg-muted/60 focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {selected && value ? (
            <>
              <Icon aria-hidden country={value} label={selected.label} />
              <span className="tabular-nums text-foreground">
                +{selected.dialCode}
              </span>
            </>
          ) : (
            <span className="text-muted-foreground">Code</span>
          )}
          <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        alignOffset={-48}
        collisionPadding={16}
        className="w-72 max-w-[calc(100vw-2rem)] gap-0 overflow-hidden p-0 duration-100"
        onOpenAutoFocus={(event) => event.preventDefault()}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 border-b p-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search country or code..."
              autoComplete="off"
              className={cn(
                searchInputClassName,
                "pl-9",
                searchQuery ? "pr-9" : undefined,
              )}
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

        <div
          className="h-64 overflow-y-auto overscroll-contain p-1"
          onWheel={(event) => event.stopPropagation()}
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => {
              const isSelected = option.value === value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected && "bg-accent text-accent-foreground",
                  )}
                  onClick={() => {
                    onChange(option.value);
                    setSearchQuery("");
                    setIsOpen(false);
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{option.label}</span>
                  <span className="shrink-0 tabular-nums text-muted-foreground">
                    +{option.dialCode}
                  </span>
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

const phoneInputClassName =
  "PhoneInput flex h-9 min-w-0 w-full items-center rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export type PhoneInputPropsCompat = Omit<
  PhoneInputProps<React.ComponentProps<"input">>,
  "value" | "onChange" | "defaultCountry" | "ref"
> & {
  value?: string;
  onChange?: (value: string) => void;
  defaultCountry?: Country;
  id?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export function PhoneInput({
  className,
  value,
  onChange,
  defaultCountry = DEFAULT_PHONE_COUNTRY,
  disabled,
  id,
  placeholder = "812 3456 7890",
  ...rest
}: PhoneInputPropsCompat) {
  return (
    <PhoneInputWithCountry
      {...rest}
      id={id}
      international={false}
      defaultCountry={defaultCountry}
      countryOptionsOrder={[DEFAULT_PHONE_COUNTRY, "..."]}
      addInternationalOption={false}
      countrySelectComponent={CountrySelect}
      countryCallingCodeEditable={false}
      limitMaxLength
      disabled={disabled}
      placeholder={placeholder}
      value={(value || undefined) as E164Number | undefined}
      onChange={(next) => {
        onChange?.(next ?? "");
      }}
      className={cn(phoneInputClassName, className)}
      numberInputProps={{
        className:
          "PhoneInputInput border-0 bg-transparent p-0 shadow-none outline-none focus-visible:ring-0",
      }}
    />
  );
}
