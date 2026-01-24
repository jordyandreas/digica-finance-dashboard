"use client";

import * as React from "react";
import { modals, type ModalComponentNames } from "@/components/modals";
import { useModalStore } from "@/store/modal-store";

export function ModalProvider() {
  const registry = useModalStore((state) => state.registry);
  const { setModalState } = useModalStore.getState();

  const activeEntry = Object.entries(registry).find(
    ([, entry]) => entry?.isOpen,
  );

  if (!activeEntry) {
    return null;
  }

  const [activeModalName, activeModalEntry] = activeEntry;

  const ModalComponent = modals[activeModalName as ModalComponentNames];
  const dynamicProps = activeModalEntry?.props;

  if (!ModalComponent) {
    console.error(
      `Modal component "${activeModalName}" not found in ModalProvider map.`,
    );
    setModalState(activeModalName as ModalComponentNames, false);
    return null;
  }

  return <ModalComponent {...dynamicProps} />;
}
