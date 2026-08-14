"use client";

import React, { useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { WorkspaceHeader } from "./workspace-header";
import { SourcesPanel } from "@/features/sources";
import { ChatPanel } from "@/features/chat";
import { StudioPanel } from "@/features/learn";
import { useWorkspace } from "../hooks/use-workspace";
import { useSources } from "@/features/sources";
import { useChat } from "@/features/chat";
import { useArtifacts } from "@/features/learn";
import { Layers, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkspaceLayoutProps {
  workspaceId: string;
}

type MobileTab = "sources" | "chat" | "studio";

export function WorkspaceLayout({ workspaceId }: WorkspaceLayoutProps) {
  const [mobileTab, setMobileTab] = useState<MobileTab>("chat");

  const {
    workspace,
    isLoading: isWorkspaceLoading,
    updateWorkspace,
  } = useWorkspace(workspaceId);

  const {
    sources,
    selectedSourceIds,
    toggleSourceSelection,
    selectAllSources,
    deselectAllSources,
    uploadPdf,
    importWebsite,
    importYoutube,
    createTextSource,
    deleteSource,
    isLoading: isSourcesLoading,
  } = useSources(workspaceId);

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
            className="min-w-[220px]"
          >
            <SourcesPanel
              sources={sources}
              selectedSourceIds={selectedSourceIds}
              onToggleSelect={toggleSourceSelection}
              onSelectAll={selectAllSources}
              onDeselectAll={deselectAllSources}
              onUploadPdf={uploadPdf}
              onImportWebsite={importWebsite}
              onImportYoutube={importYoutube}
              onCreateTextSource={createTextSource}
              onDeleteSource={deleteSource}
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
            className="min-w-[240px]"
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
              onUploadPdf={uploadPdf}
              onImportWebsite={importWebsite}
              onImportYoutube={importYoutube}
              onCreateTextSource={createTextSource}
              onDeleteSource={deleteSource}
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

        {/* Mobile Bottom Navigation Bar */}
        <div className="h-12 border-t border-zinc-800 bg-[#09090b] grid grid-cols-3 shrink-0">
          <button
            onClick={() => setMobileTab("sources")}
            className={cn(
              "flex flex-col items-center justify-center text-[10px] gap-0.5",
              mobileTab === "sources" ? "text-white font-medium" : "text-zinc-500"
            )}
          >
            <Layers className="w-4 h-4" />
            <span>Sources ({sources.length})</span>
          </button>

          <button
            onClick={() => setMobileTab("chat")}
            className={cn(
              "flex flex-col items-center justify-center text-[10px] gap-0.5",
              mobileTab === "chat" ? "text-white font-medium" : "text-zinc-500"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Chat</span>
          </button>

          <button
            onClick={() => setMobileTab("studio")}
            className={cn(
              "flex flex-col items-center justify-center text-[10px] gap-0.5",
              mobileTab === "studio" ? "text-white font-medium" : "text-zinc-500"
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
