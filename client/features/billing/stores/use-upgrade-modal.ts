"use client";

import { create } from "zustand";

interface BuyCreditsModalStore {
  isOpen: boolean;
  reason?: string;
  requiredCredits?: number;
  currentCredits?: number;
  limitType?: "workspaces" | "artifacts" | "sources" | "messages" | "general" | "credits";
  openUpgradeModal: (options?: {
    reason?: string;
    requiredCredits?: number;
    currentCredits?: number;
    limitType?: "workspaces" | "artifacts" | "sources" | "messages" | "general" | "credits";
  }) => void;
  closeUpgradeModal: () => void;
  openBuyCreditsModal: (options?: {
    reason?: string;
    requiredCredits?: number;
    currentCredits?: number;
  }) => void;
  closeBuyCreditsModal: () => void;
}

export const useUpgradeModal = create<BuyCreditsModalStore>((set) => ({
  isOpen: false,
  reason: undefined,
  requiredCredits: undefined,
  currentCredits: undefined,
  limitType: "general",
  openUpgradeModal: (options) =>
    set({
      isOpen: true,
      reason: options?.reason,
      requiredCredits: options?.requiredCredits,
      currentCredits: options?.currentCredits,
      limitType: options?.limitType || "credits",
    }),
  closeUpgradeModal: () =>
    set({
      isOpen: false,
      reason: undefined,
      requiredCredits: undefined,
      currentCredits: undefined,
      limitType: "general",
    }),
  openBuyCreditsModal: (options) =>
    set({
      isOpen: true,
      reason: options?.reason,
      requiredCredits: options?.requiredCredits,
      currentCredits: options?.currentCredits,
      limitType: "credits",
    }),
  closeBuyCreditsModal: () =>
    set({
      isOpen: false,
      reason: undefined,
      requiredCredits: undefined,
      currentCredits: undefined,
      limitType: "general",
    }),
}));

export const useBuyCreditsModal = useUpgradeModal;
