"use client";

import { shallow } from "zustand/shallow";
import type { ModalComponentNames } from "@/components/modals";
import { useModalStore } from "@/store/modal-store";
import type { ModalEntry, ModalType } from "@/store/modal-store";

export function useModal<P extends object>(
  name: ModalComponentNames,
): ModalType<P> {
  const { setModalState } = useModalStore.getState();

  const modalState = useModalStore(
    (state) => state.registry[name] as ModalEntry<P> | undefined,
    // @ts-expect-error type mismatch
    shallow,
  );
  const initialEntry: ModalEntry<P> = { isOpen: false, props: {} as P };
  // @ts-expect-error type mismatch caused by shallow
  const { isOpen, props } = modalState || initialEntry;

  const open = (dynamicProps?: P) => setModalState<P>(name, true, dynamicProps);
  const close = () => setModalState(name, false);

  return {
    open,
    close,
    isOpen,
    props,
  };
}
