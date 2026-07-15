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

export function toTitleCase(value?: unknown) {
  const text = `${value ?? ""}`.trim();
  if (isEmpty(text)) return "";
  return text
    .split(/\s+/)
    .map((word) => {
      if (isEmpty(word)) return word;
      return `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}`;
    })
    .join(" ");
}
