"use client";

import { create } from "zustand";

interface UpgradeModalStore {
  isOpen: boolean;
  reason?: string;
  limitType?: "workspaces" | "artifacts" | "sources" | "messages" | "general";
  openUpgradeModal: (options?: {
    reason?: string;
    limitType?: "workspaces" | "artifacts" | "sources" | "messages" | "general";
  }) => void;
  closeUpgradeModal: () => void;
}

export const useUpgradeModal = create<UpgradeModalStore>((set) => ({
  isOpen: false,
  reason: undefined,
  limitType: "general",
  openUpgradeModal: (options) =>
    set({
      isOpen: true,
      reason: options?.reason,
      limitType: options?.limitType || "general",
    }),
  closeUpgradeModal: () =>
    set({
      isOpen: false,
      reason: undefined,
      limitType: "general",
    }),
}));
