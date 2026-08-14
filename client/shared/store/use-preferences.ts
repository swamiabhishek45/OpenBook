import { create } from "zustand";
import { persist } from "zustand/middleware";

interface PreferencesState {
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  webSearchDefault: boolean;
  setWebSearchDefault: (enabled: boolean) => void;
  selectedModel: string;
  setSelectedModel: (model: string) => void;
}

export const usePreferences = create<PreferencesState>()(
  persist(
    (set) => ({
      viewMode: "grid",
      setViewMode: (mode) => set({ viewMode: mode }),
      webSearchDefault: false,
      setWebSearchDefault: (enabled) => set({ webSearchDefault: enabled }),
      selectedModel: "gpt-4o-mini",
      setSelectedModel: (model) => set({ selectedModel: model }),
    }),
    {
      name: "chaibook-preferences",
    }
  )
);
