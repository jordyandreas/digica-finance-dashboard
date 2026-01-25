"use client";

import * as React from "react";

export interface DeleteConfirmationState<T = unknown> {
  isOpen: boolean;
  item: T | null;
  title: string;
  description: string;
}

export interface UseDeleteConfirmationOptions {
  title?: string;
  description?: string;
}

export interface UseDeleteConfirmationReturn<T> {
  isOpen: boolean;
  item: T | null;
  title: string;
  description: string;
  openConfirmation: (item: T, customTitle?: string, customDescription?: string) => void;
  closeConfirmation: () => void;
  setOpen: (open: boolean) => void;
}

export function useDeleteConfirmation<T = unknown>(
  options: UseDeleteConfirmationOptions = {}
): UseDeleteConfirmationReturn<T> {
  const {
    title: defaultTitle = "Do you want to delete this item?",
    description: defaultDescription = "You can't take it back when you delete it",
  } = options;

  const [state, setState] = React.useState<DeleteConfirmationState<T>>({
    isOpen: false,
    item: null,
    title: defaultTitle,
    description: defaultDescription,
  });

  const openConfirmation = React.useCallback(
    (item: T, customTitle?: string, customDescription?: string) => {
      setState({
        isOpen: true,
        item,
        title: customTitle ?? defaultTitle,
        description: customDescription ?? defaultDescription,
      });
    },
    [defaultTitle, defaultDescription]
  );

  const closeConfirmation = React.useCallback(() => {
    setState((prev) => ({
      ...prev,
      isOpen: false,
      item: null,
    }));
  }, []);

  const setOpen = React.useCallback((open: boolean) => {
    if (!open) {
      closeConfirmation();
    }
  }, [closeConfirmation]);

  return {
    isOpen: state.isOpen,
    item: state.item,
    title: state.title,
    description: state.description,
    openConfirmation,
    closeConfirmation,
    setOpen,
  };
}
