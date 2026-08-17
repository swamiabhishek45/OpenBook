"use client";

import React, { useState } from "react";
import { LearningArtifact } from "../types";
import { FlashcardsViewer } from "./flashcards-viewer";
import { QuizViewer } from "./quiz-viewer";
import { MindmapViewer } from "./mindmap-viewer";
import { TakeawaysViewer } from "./takeaways-viewer";
import { SummaryViewer } from "./summary-viewer";
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

interface ArtifactModalProps {
  artifact: LearningArtifact | null;
  onClose: () => void;
}

export function ArtifactModal({ artifact, onClose }: ArtifactModalProps) {
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

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
                <span>{artifact.type}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Calendar className="w-3 h-3" />
                  {formatDate(artifact.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              title="Copy content"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground text-xs transition-colors"
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
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
            <MindmapViewer content={artifact.content?.nodes || artifact.content || {}} />
          )}
        </div>
      </div>
    </div>
  );
}
