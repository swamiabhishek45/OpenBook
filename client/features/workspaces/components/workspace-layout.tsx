"use client";

import React, { useState } from "react";
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
import { Layers, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  workspaceId: string;
}

type MobileTab = "sources" | "chat" | "studio";

export function WorkspaceLayout({ workspaceId }: WorkspaceLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);

  const {
    workspace,
    isLoading: isWorkspaceLoading,
    updateWorkspace,
  } = useWorkspace(workspaceId);

  const sourcesQuery = useSources(workspaceId);
  const sources = sourcesQuery.data || [];
  const isSourcesLoading = sourcesQuery.isLoading;

  const uploadPdfMutation = useUploadPdfSource(workspaceId);
  const importWebsiteMutation = useImportWebsiteSource(workspaceId);
  const importYoutubeMutation = useImportYoutubeSource(workspaceId);
  const createSourceMutation = useCreateSource(workspaceId);
  const deleteSourceMutation = useDeleteSource(workspaceId);

  const toggleSourceSelection = (id: string) => {
    setSelectedSourceIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllSources = () => {
    setSelectedSourceIds(sources.map((s) => s.id));
  };

  const deselectAllSources = () => {
    setSelectedSourceIds([]);
  };

  const {
    messages,
    isStreaming,
    sendMessage,
    startNewChat,
    webSearchEnabled,
    setWebSearchEnabled,
    conversations,
    currentConversationId,
    setCurrentConversationId,
    deleteConversation,
  } = useChat(workspaceId);

  const {
    artifacts,
    createArtifact,
    deleteArtifact,
    isCreating: isArtifactCreating,
  } = useArtifacts(workspaceId);

  if (isWorkspaceLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-background text-foreground flex flex-col overflow-hidden font-sans select-none">
      {/* Workspace Header */}
      <WorkspaceHeader
        workspace={workspace || null}
        sourcesCount={sources.length}
        onUpdateTitle={(title) => updateWorkspace({ title })}
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
          <ResizablePanel defaultSize="52%" minSize="30%">
            <ChatPanel
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onNewChat={startNewChat}
              selectedSourcesCount={selectedSourceIds.length}
              webSearchEnabled={webSearchEnabled}
              onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => setCurrentConversationId(id || undefined)}
              onDeleteConversation={deleteConversation}
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
                  sourceIds:
                    selectedSourceIds.length > 0
                      ? selectedSourceIds
                      : undefined,
                })
              }
              onDeleteArtifact={deleteArtifact}
              isCreating={isArtifactCreating}
              selectedSourcesCount={sources.length}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>

      {/* Mobile View: Single Panel with Tab Bar */}
      <div className="flex md:hidden flex-1 flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          {mobileTab === "sources" && (
            <SourcesPanel
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
              messages={messages}
              isStreaming={isStreaming}
              onSendMessage={sendMessage}
              onNewChat={startNewChat}
              selectedSourcesCount={selectedSourceIds.length}
              webSearchEnabled={webSearchEnabled}
              onToggleWebSearch={() => setWebSearchEnabled(!webSearchEnabled)}
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => setCurrentConversationId(id || undefined)}
              onDeleteConversation={deleteConversation}
            />
          )}

          {mobileTab === "studio" && (
            <StudioPanel
              artifacts={artifacts}
              onCreateArtifact={(type) =>
                createArtifact({
                  type,
                  sourceIds:
                    selectedSourceIds.length > 0
                      ? selectedSourceIds
                      : undefined,
                })
              }
              onDeleteArtifact={deleteArtifact}
              isCreating={isArtifactCreating}
              selectedSourcesCount={sources.length}
            />
          )}
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="h-14 border-t border-border bg-card flex items-center justify-around px-4 z-20 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab("sources")}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
              mobileTab === "sources"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Sources ({sources.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("chat")}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
              mobileTab === "chat"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileTab("studio")}
            className={cn(
              "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition-colors",
              mobileTab === "studio"
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span>Studio ({artifacts.length})</span>
          </button>
        </div>
      </div>
    </div>
  );
}
