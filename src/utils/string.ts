"use client";

const isEmpty = (value: string) => value.length === 0;

export function emptyFallback(value?: unknown) {
  const _value = `${value ?? ""}`.trim();
  return `${!isEmpty(_value) ? _value : "-"}`;
}

export function formatShortId(value?: unknown, maxLength = 7) {
  const id = `${value ?? ""}`.trim();
  if (isEmpty(id)) return "-";
  if (id.length <= maxLength) return id;
  return `${id.slice(0, maxLength)}....`;
}
