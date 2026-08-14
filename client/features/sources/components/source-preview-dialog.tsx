"use client";

import React from "react";
import { Source } from "../types";
import { X, FileText, Globe, Video, Calendar, Layers } from "lucide-react";

interface SourcePreviewDialogProps {
  source: Source | null;
  onClose: () => void;
}

export function SourcePreviewDialog({
  source,
  onClose,
}: SourcePreviewDialogProps) {
  if (!source) return null;

  const getSourceIcon = () => {
    switch (source.type) {
      case "PDF":
        return <FileText className="w-5 h-5 text-zinc-300" />;
      case "WEBSITE":
        return <Globe className="w-5 h-5 text-zinc-300" />;
      case "YOUTUBE":
        return <Video className="w-5 h-5 text-zinc-300" />;
      default:
        return <FileText className="w-5 h-5 text-zinc-300" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[85vh] bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950/40">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center shrink-0">
              {getSourceIcon()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {source.title}
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-0.5">
                <span>{source.type}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(source.createdAt).toLocaleDateString()}
                </span>
                {source.chunks && source.chunks.length > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {source.chunks.length} chunks indexed
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-zinc-200">
          {source.url && (
            <div className="p-3 bg-zinc-950/60 border border-zinc-800 rounded-lg text-xs">
              <span className="text-zinc-400">URL: </span>
              <a
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-200 underline hover:text-white break-all"
              >
                {source.url}
              </a>
            </div>
          )}

          {/* Chunks breakdown if available */}
          {source.chunks && source.chunks.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Indexed Chunks ({source.chunks.length})
              </h3>
              <div className="space-y-3">
                {source.chunks.map((chunk, index) => (
                  <div
                    key={chunk.id || index}
                    className="p-3.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                      <span>Chunk #{index + 1}</span>
                      {chunk.tokenCount ? (
                        <span>{chunk.tokenCount} tokens</span>
                      ) : null}
                    </div>
                    <p className="text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
                      {chunk.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : source.content ? (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Content
              </h3>
              <div className="p-4 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto">
                {source.content}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-zinc-500">
              No content preview available for this source.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
