"use client";

import React, { useState, useEffect, useRef } from "react";


import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "./workspace-header";
import {
  SourcesPanel,
  useSources,
  useUploadPdfSource,
  useImportWebsiteSource,
  useImportYoutubeSource,
  useCreateSource,
  useDeleteSource,
} from "@/features/sources";
import { ChatPanel, useChat } from "@/features/chat";
import { StudioPanel, useArtifacts } from "@/features/learn";
import { useWorkspace } from "../hooks/use-workspace";
import { Layers, MessageSquare, Sparkles } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  workspaceId: string;
}

type MobileTab = "sources" | "chat" | "studio";

export function WorkspaceLayout({ workspaceId }: WorkspaceLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const initialSelectionDone = useRef(false);
  const prevSourcesLength = useRef(0);

  const {
    workspace,
    isLoading: isWorkspaceLoading,
    updateWorkspace,
  } = useWorkspace(workspaceId);

  const sourcesQuery = useSources(workspaceId);
  const sources = sourcesQuery.data || [];
  const isSourcesLoading = sourcesQuery.isLoading;

  const storageKey = `openbook_selected_sources_${workspaceId}`;

  // Initial load: restore persisted selection or default to all sources
  useEffect(() => {
    if (sources.length > 0 && !initialSelectionDone.current) {
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved !== null) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              // Keep only source IDs that still exist in current workspace sources
              const valid = parsed.filter((id) =>
                sources.some((s) => s.id === id)
              );
              setSelectedSourceIds(valid);
              initialSelectionDone.current = true;
              return;
            }
          }
        } catch {}
      }
      // If first time, default to all sources and persist
      const allIds = sources.map((s) => s.id);
      setSelectedSourceIds(allIds);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(allIds));
        } catch {}
      }
      initialSelectionDone.current = true;
    }
  }, [sources, storageKey]);

  // Helper to update selection and persist to localStorage
  const updateAndPersistSelection = (updater: (prev: string[]) => string[]) => {
    setSelectedSourceIds((prev) => {
      const next = updater(prev);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {}
      }
      return next;
    });
  };

  // When newly created/imported sources appear, include them in selection and persist
  useEffect(() => {
    if (sources.length > prevSourcesLength.current && prevSourcesLength.current > 0) {
      updateAndPersistSelection((prev) => {
        const allIds = sources.map((s) => s.id);
        const added = allIds.filter((id) => !prev.includes(id));
        return [...prev, ...added];
      });
    }
    prevSourcesLength.current = sources.length;
  }, [sources]);

  const uploadPdfMutation = useUploadPdfSource(workspaceId);
  const importWebsiteMutation = useImportWebsiteSource(workspaceId);
  const importYoutubeMutation = useImportYoutubeSource(workspaceId);
  const createSourceMutation = useCreateSource(workspaceId);
  const deleteSourceMutation = useDeleteSource(workspaceId);

  const toggleSourceSelection = (id: string) => {
    updateAndPersistSelection((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllSources = () => {
    const allIds = sources.map((s) => s.id);
    updateAndPersistSelection(() => allIds);
  };

  const deselectAllSources = () => {
    updateAndPersistSelection(() => []);
  };



  const {
    messages,
    isStreaming,
    sendMessage,
    stopStreaming,
    startNewChat,
    webSearchEnabled,
    setWebSearchEnabled,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    deleteConversation,
    clearConversation,
  } = useChat(workspaceId, undefined, workspace?.defaultModel);

  const {
    artifacts,
    createArtifact,
    deleteArtifact,
    retryArtifact,
    isCreating: isArtifactCreating,
    isRetrying: isArtifactRetrying,
    retryingArtifactId,
  } = useArtifacts(workspaceId);

  const MOBILE_TABS: {
    id: MobileTab;
    label: string;
    icon: typeof Layers;
    count: number;
  }[] = [
    { id: "sources", label: "Sources", icon: Layers, count: sources.length },
    { id: "chat", label: "Chat", icon: MessageSquare, count: 0 },
    { id: "studio", label: "Studio", icon: Sparkles, count: artifacts.length },
  ];

  if (isWorkspaceLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <ThemeLoader size={36} />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans">
      {/* Workspace Header */}
      <WorkspaceHeader
        workspace={workspace || null}
        sourcesCount={sources.length}
        onUpdateTitle={(title) => updateWorkspace({ title })}
        onUpdateModel={(defaultModel) => updateWorkspace({ defaultModel })}
      />

      {/* Desktop / Tablet: 3-Column Resizable Split View */}
      <div className="hidden md:flex flex-1 min-h-0 w-full overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          {/* Left Panel: Sources */}
          <ResizablePanel
            defaultSize="22%"
            minSize="15%"
            maxSize="35%"
            className="min-w-55"
          >
            <SourcesPanel
              workspaceId={workspaceId}
              sources={sources}
              selectedSourceIds={selectedSourceIds}
              onToggleSelect={toggleSourceSelection}
              onSelectAll={selectAllSources}
              onDeselectAll={deselectAllSources}
              onUploadPdf={(file, title) => uploadPdfMutation.mutateAsync({ file, title })}
              onImportWebsite={(url, title) => importWebsiteMutation.mutateAsync({ url, title })}
              onImportYoutube={(url, title) => importYoutubeMutation.mutateAsync({ url, title })}
              onCreateTextSource={(title, content) =>
                createSourceMutation.mutateAsync({ type: "TEXT", title, content })
              }
              onDeleteSource={(id) => deleteSourceMutation.mutateAsync(id)}
              isLoading={isSourcesLoading}
            />
          </ResizablePanel>

          {/* Draggable Handle */}
          <ResizableHandle withHandle />

          {/* Middle Panel: Chat Interface */}
          <ResizablePanel defaultSize="52%" minSize="30%" className="min-w-0">
            <ChatPanel
              workspaceId={workspaceId}
              defaultModel={workspace?.defaultModel}
              onModelChange={(defaultModel) => updateWorkspace({ defaultModel })}
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onStopStreaming={stopStreaming}
              onNewChat={startNewChat}
              selectedSourcesCount={selectedSourceIds.length}
              webSearchEnabled={webSearchEnabled}
              onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => setCurrentConversationId(id || undefined)}
              onDeleteConversation={deleteConversation}
              onClearConversation={clearConversation}
            />
          </ResizablePanel>

          {/* Draggable Handle */}
          <ResizableHandle withHandle />

          {/* Right Panel: Studio & Artifacts */}
          <ResizablePanel
            defaultSize="26%"
            minSize="18%"
            maxSize="40%"
            className="min-w-55"
          >
            <StudioPanel
              artifacts={artifacts}
              onCreateArtifact={(type) =>
                createArtifact({
                  type,
                  sourceIds: selectedSourceIds,
                })
              }
              onDeleteArtifact={deleteArtifact}
              onRetryArtifact={retryArtifact}
              isCreating={isArtifactCreating}
              isRetrying={isArtifactRetrying}
              retryingArtifactId={retryingArtifactId}
              selectedSourcesCount={selectedSourceIds.length}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View: Single Panel with Tab Bar */}
      <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mobileTab === "sources" && (
            <SourcesPanel
              workspaceId={workspaceId}
              sources={sources}
              selectedSourceIds={selectedSourceIds}
              onToggleSelect={toggleSourceSelection}
              onSelectAll={selectAllSources}
              onDeselectAll={deselectAllSources}
              onUploadPdf={(file, title) => uploadPdfMutation.mutateAsync({ file, title })}
              onImportWebsite={(url, title) => importWebsiteMutation.mutateAsync({ url, title })}
              onImportYoutube={(url, title) => importYoutubeMutation.mutateAsync({ url, title })}
              onCreateTextSource={(title, content) =>
                createSourceMutation.mutateAsync({ type: "TEXT", title, content })
              }
              onDeleteSource={(id) => deleteSourceMutation.mutateAsync(id)}
              isLoading={isSourcesLoading}
            />
          )}


          {mobileTab === "chat" && (
            <ChatPanel
              workspaceId={workspaceId}
              defaultModel={workspace?.defaultModel}
              onModelChange={(defaultModel) => updateWorkspace({ defaultModel })}
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onStopStreaming={stopStreaming}
              onNewChat={startNewChat}
              selectedSourcesCount={selectedSourceIds.length}
              webSearchEnabled={webSearchEnabled}
              onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => setCurrentConversationId(id || undefined)}
              onDeleteConversation={deleteConversation}
              onClearConversation={clearConversation}
            />
          )}

          {mobileTab === "studio" && (
            <StudioPanel
              artifacts={artifacts}
              onCreateArtifact={(type) =>
                createArtifact({
                  type,
                  sourceIds: selectedSourceIds,
                })
              }
              onDeleteArtifact={deleteArtifact}
              onRetryArtifact={retryArtifact}
              isCreating={isArtifactCreating}
              isRetrying={isArtifactRetrying}
              retryingArtifactId={retryingArtifactId}
              selectedSourcesCount={selectedSourceIds.length}
            />
          )}
        </div>


        {/* Mobile navigation: one pill bar, matching the header chrome. */}
        <nav
          aria-label="Workspace panels"
          className="z-20 shrink-0 px-3 pt-1 pb-3"
        >
          <div className="flex items-center gap-1 rounded-full bg-muted/70 p-1.5 backdrop-blur-xl dark:bg-muted/60">
            {MOBILE_TABS.map(({ id, label, icon: Icon, count }) => {
              const isActive = mobileTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMobileTab(id)}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex h-10 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full text-[13px] font-medium",
                    "transition-[background-color,color] duration-150 ease-out active:scale-[0.97]",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    isActive
                      ? "bg-foreground text-background"
                      : "text-foreground/75 hover:bg-foreground/6 hover:text-foreground"
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{label}</span>
                  {count > 0 && (
                    <span
                      className={cn(
                        "font-mono text-[11px]",
                        isActive ? "text-background/70" : "text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
