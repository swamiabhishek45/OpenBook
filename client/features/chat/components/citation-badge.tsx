"use client";

import React, { useState } from "react";
import { Citation } from "../types";
import { FileText, Globe, ExternalLink } from "lucide-react";

interface CitationBadgeProps {
  citation: Citation;
  index: number;
}

export function CitationBadge({ citation, index }: CitationBadgeProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="relative inline-block align-baseline mx-0.5">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center h-4 min-w-4 px-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-mono font-medium border border-zinc-700 transition-colors cursor-pointer"
        title={citation.sourceTitle || "Source Citation"}
      >
        {index + 1}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 bottom-full mb-2 w-72 p-3 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl z-50 text-left space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1.5">
              <div className="flex items-center gap-1.5 min-w-0">
                {citation.url ? (
                  <Globe className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                )}
                <span className="text-xs font-semibold text-white truncate">
                  {citation.sourceTitle || "Source Reference"}
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                #{index + 1}
              </span>
            </div>

            {citation.excerpt && (
              <p className="text-xs text-zinc-300 leading-relaxed max-h-32 overflow-y-auto italic">
                &ldquo;{citation.excerpt}&rdquo;
              </p>
            )}

            {citation.url && (
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white underline pt-1"
              >
                <span>Open original link</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </>
      )}
    </span>
  );
}
