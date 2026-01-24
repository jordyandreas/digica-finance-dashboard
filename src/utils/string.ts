"use client";

const isEmpty = (value: string) => value.length === 0;

export function emptyFallback(value?: unknown) {
  const _value = `${value ?? ""}`.trim();
  return `${!isEmpty(_value) ? _value : "-"}`;
}
