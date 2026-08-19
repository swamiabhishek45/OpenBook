"use client";

import React, { useState } from "react";
import { LearningArtifact } from "../types";
import { FlashcardsViewer } from "./flashcards-viewer";
import { QuizViewer } from "./quiz-viewer";
import { MindmapViewer } from "./mindmap-viewer";
import { TakeawaysViewer } from "./takeaways-viewer";
import { SummaryViewer } from "./summary-viewer";
import { PodcastViewer } from "./podcast-viewer";
import { formatDate } from "@/lib/utils";
import {
  X,
  BookOpen,
  HelpCircle,
  Layers,
  Network,
  ListChecks,
  FileText,
  Copy,
  Check,
  Calendar,
} from "lucide-react";
import { AudioLinesIcon } from "@/components/ui/audio-lines";

import { ExternalLink } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { apiClient } from "@/lib/api-client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

interface ArtifactModalProps {
  artifact: LearningArtifact | null;
  onClose: () => void;
}

export function ArtifactModal({ artifact, onClose }: ArtifactModalProps) {
  const queryClient = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [isExportingNotion, setIsExportingNotion] = useState(false);
  const [exportedNotionUrl, setExportedNotionUrl] = useState<string | null>(null);

  // Sync / reset exported Notion URL specifically for the active artifact
  useEffect(() => {
    const existingUrl = (artifact?.metadata as Record<string, unknown> | undefined)?.notionPageUrl;
    setExportedNotionUrl(typeof existingUrl === "string" ? existingUrl : null);
    setCopied(false);
  }, [artifact?.id, artifact?.metadata]);

  if (!artifact) return null;

  const handleExportNotion = async () => {
    if (!artifact.workspaceId || !artifact.id) return;
    setIsExportingNotion(true);
    try {
      const res = await apiClient<{ success: boolean; url: string }>(
        `/api/workspaces/${artifact.workspaceId}/artifacts/${artifact.id}/export/notion`,
        { method: "POST" }
      );
      if (res.url) {
        setExportedNotionUrl(res.url);
        void queryClient.invalidateQueries({
          queryKey: ["artifacts", artifact.workspaceId],
        });
      }
    } catch (err: unknown) {
      console.error("Failed to export to Notion:", err);
      alert(
        err instanceof Error
          ? err.message
          : "Failed to export to Notion. Please ensure your Notion workspace is connected in Settings."
      );
    } finally {
      setIsExportingNotion(false);
    }
  };



  const handleCopyMarkdown = () => {
    let textToCopy = "";
    if (artifact.content?.markdown) {
      textToCopy = artifact.content.markdown;
    } else if (artifact.content?.items) {
      textToCopy = artifact.content.items.map((it) => `- ${it}`).join("\n");
    } else if (artifact.content?.cards) {
      textToCopy = artifact.content.cards
        .map((c) => `Q: ${c.front}\nA: ${c.back}\n`)
        .join("\n---\n");
    } else if (artifact.content?.podcast?.transcript) {
      textToCopy = artifact.content.podcast.transcript
        .map((t) => `${t.speaker.toUpperCase()}:\n${t.text}`)
        .join("\n\n");
    }
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getTypeIcon = () => {
    switch (artifact.type) {
      case "SUMMARY":
        return <BookOpen className="w-5 h-5 text-foreground" />;
      case "FLASHCARDS":
        return <Layers className="w-5 h-5 text-foreground" />;
      case "QUIZ":
        return <HelpCircle className="w-5 h-5 text-foreground" />;
      case "MINDMAP":
        return <Network className="w-5 h-5 text-foreground" />;
      case "TAKEAWAYS":
        return <ListChecks className="w-5 h-5 text-foreground" />;
      case "REPORT":
        return <FileText className="w-5 h-5 text-foreground" />;
      case "PODCAST":
        return <AudioLinesIcon size={20} className="text-foreground" />;
      default:
        return <BookOpen className="w-5 h-5 text-foreground" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-card border border-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn text-foreground">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
              {getTypeIcon()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground truncate">
                {artifact.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5 font-mono">
                <span>{artifact.type === "PODCAST" ? "AUDIO PODCAST" : artifact.type}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Calendar className="w-3 h-3" />
                  {formatDate(artifact.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Export to Notion */}
            <button
              onClick={handleExportNotion}

              disabled={isExportingNotion}
              title="1-Click Export to connected Notion Workspace"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isExportingNotion ? (
                <ThemeLoader size={13} />
              ) : exportedNotionUrl ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <BookOpen className="w-3.5 h-3.5" />
              )}
              <span>
                {isExportingNotion
                  ? "Exporting..."
                  : exportedNotionUrl
                  ? "Exported!"
                  : "Export Notion"}
              </span>
            </button>

            {exportedNotionUrl && (
              <a
                href={exportedNotionUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            <button
              onClick={handleCopyMarkdown}
              title="Copy content"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Podcast Debate View */}
          {artifact.type === "PODCAST" && (
            <PodcastViewer
              content={artifact.content}
              artifactId={artifact.id}
              workspaceId={artifact.workspaceId}
            />
          )}


          {/* Flashcards View */}
          {artifact.type === "FLASHCARDS" && artifact.content?.cards && (
            <FlashcardsViewer cards={artifact.content.cards} />
          )}

          {/* Quiz View */}
          {artifact.type === "QUIZ" && artifact.content?.questions && (
            <QuizViewer questions={artifact.content.questions} />
          )}

          {/* Takeaways List */}
          {artifact.type === "TAKEAWAYS" && (
            <TakeawaysViewer content={artifact.content?.items || []} />
          )}

          {/* Summary / Report View */}
          {(artifact.type === "SUMMARY" || artifact.type === "REPORT") && (
            <SummaryViewer
              content={artifact.content?.markdown || ""}
              title={artifact.title}
            />
          )}

          {/* Mindmap Nodes View */}
          {artifact.type === "MINDMAP" && (
            <MindmapViewer content={artifact.content} />
          )}
        </div>
      </div>
    </div>
  );
}
