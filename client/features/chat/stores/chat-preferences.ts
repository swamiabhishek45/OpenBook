"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;
export type ChatModelId = (typeof CHAT_MODELS)[number];

export const CHAT_MODEL_LABELS: Record<ChatModelId, string> = {
    "gpt-4o-mini": "GPT-4o mini",
    "gpt-4o": "GPT-4o",
};

export type WorkspaceChatPrefs = {
    model: ChatModelId;
    webSearch: boolean;
};

export type ChatPreferencesState = {
    byWorkspace: Record<string, WorkspaceChatPrefs>;
    getPrefs: (
        workspaceId: string,
        defaultModel?: string,
    ) => WorkspaceChatPrefs;
    setModel: (workspaceId: string, model: ChatModelId) => void;
    setWebSearch: (workspaceId: string, enabled: boolean) => void;
};

function resolveModel(model?: string): ChatModelId {
    if (model && CHAT_MODELS.includes(model as ChatModelId)) {
        return model as ChatModelId;
    }

    return "gpt-4o-mini";
}

export const useChatPreferences = create<ChatPreferencesState>()(
    persist(
        (set, get) => ({
            byWorkspace: {},
            getPrefs: (workspaceId, defaultModel) => {
                const existing = get().byWorkspace[workspaceId];
                if (existing) {
                    return existing;
                }

                return {
                    model: resolveModel(defaultModel),
                    webSearch: false,
                };
            },
            setModel: (workspaceId, model) =>
                set((state) => ({
                    byWorkspace: {
                        ...state.byWorkspace,
                        [workspaceId]: {
                            ...state.getPrefs(workspaceId),
                            model,
                        },
                    },
                })),
            setWebSearch: (workspaceId, webSearch) =>
                set((state) => ({
                    byWorkspace: {
                        ...state.byWorkspace,
                        [workspaceId]: {
                            ...state.getPrefs(workspaceId),
                            webSearch,
                        },
                    },
                })),
        }),
        { name: "chaibook-chat-preferences" },
    ),
);
