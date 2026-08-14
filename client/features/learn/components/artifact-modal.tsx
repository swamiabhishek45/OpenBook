"use client";

import React, { useState } from "react";
import { LearningArtifact } from "../types";
import { FlashcardsViewer } from "./flashcards-viewer";
import { QuizViewer } from "./quiz-viewer";
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
        return <BookOpen className="w-5 h-5 text-zinc-300" />;
      case "FLASHCARDS":
        return <Layers className="w-5 h-5 text-zinc-300" />;
      case "QUIZ":
        return <HelpCircle className="w-5 h-5 text-zinc-300" />;
      case "MINDMAP":
        return <Network className="w-5 h-5 text-zinc-300" />;
      case "TAKEAWAYS":
        return <ListChecks className="w-5 h-5 text-zinc-300" />;
      case "REPORT":
        return <FileText className="w-5 h-5 text-zinc-300" />;
      default:
        return <BookOpen className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-9 h-9 rounded-xl bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
              {getTypeIcon()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {artifact.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5 font-mono">
                <span>{artifact.type}</span>
                <span>•</span>
                <span className="flex items-center gap-1 font-sans">
                  <Calendar className="w-3 h-3" />
                  {new Date(artifact.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              title="Copy content"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs transition-colors"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
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
          {artifact.type === "TAKEAWAYS" && artifact.content?.items && (
            <div className="space-y-3 max-w-2xl mx-auto">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">
                Key Takeaways &amp; Findings
              </h3>
              <div className="space-y-2.5">
                {artifact.content.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 flex items-start gap-3 text-sm text-zinc-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary / Report / Markdown View */}
          {(artifact.type === "SUMMARY" || artifact.type === "REPORT") &&
            artifact.content?.markdown && (
              <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-zinc-950/70 border border-zinc-800/80 text-zinc-200 space-y-4 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {artifact.content.markdown}
              </div>
            )}

          {/* Mindmap Nodes & Edges View */}
          {artifact.type === "MINDMAP" && artifact.content?.nodes && (
            <div className="max-w-2xl mx-auto space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Mind Map Hierarchy
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {artifact.content.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center gap-2.5"
                  >
                    <div className="w-2 h-2 rounded-full bg-white shrink-0" />
                    <span className="text-xs font-medium text-zinc-200">
                      {node.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
