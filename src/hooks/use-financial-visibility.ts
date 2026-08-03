"use client";

import { useCallback, useSyncExternalStore } from "react";

const STORAGE_KEY = "digica:financial-amounts-visible";
const CHANGE_EVENT = "digica:financial-visibility-change";

function readStoredVisibility(): boolean {
  if (typeof window === "undefined") {
    return true;
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === null) {
    return true;
  }

  return stored === "true";
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleChange);
  window.addEventListener(CHANGE_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(CHANGE_EVENT, handleChange);
  };
}

function getSnapshot() {
  return readStoredVisibility();
}

function getServerSnapshot() {
  return true;
}

function writeVisibility(visible: boolean) {
  window.localStorage.setItem(STORAGE_KEY, String(visible));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useFinancialVisibility() {
  const isVisible = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setVisible = useCallback((visible: boolean) => {
    writeVisibility(visible);
  }, []);

  const toggle = useCallback(() => {
    writeVisibility(!readStoredVisibility());
  }, []);

  return { isVisible, toggle, setVisible };
}
