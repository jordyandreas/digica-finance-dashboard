"use client";

import { create } from "zustand";
import type { ModalComponentNames } from "@/components/modals";

export interface ModalType<P extends object> {
  open: (props?: P) => void;
  close: () => void;
  isOpen: boolean;
  props: P;
}

export interface ModalEntry<P extends object> {
  isOpen: boolean;
  props: P;
}

interface ModalStoreState {
  registry: Partial<Record<ModalComponentNames, ModalEntry<Record<string, unknown>>>>;
  setModalState: <P extends object>(
    name: ModalComponentNames,
    isOpen: boolean,
    props?: P,
  ) => void;
}

export const useModalStore = create<ModalStoreState>((set) => ({
  registry: {},

  setModalState: (name, isOpen, props) => {
    set((state) => {
      const currentEntry = state.registry[name];
      const incomingProps = props ?? {};
      const newProps = isOpen ? incomingProps : (currentEntry?.props ?? {});

      return {
        registry: {
          ...state.registry,
          [name]: {
            props: newProps,
            isOpen,
          },
        },
      };
    });
  },
}));
