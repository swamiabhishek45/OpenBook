"use client";

import React, { useState } from "react";
import {
  FileText,
  Globe,
  FileCode,
  Check,
  Search,
  Database,
  Layers,
  Cpu,
  ShieldCheck,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";

const SOURCE_FEATURES = [
  {
    id: "pdf",
    title: "PDF & Document Engine",
    icon: <FileText className="w-5 h-5 text-red-500" />,
    badge: "Vector Chunking",
    description:
      "Upload multi-page research papers, slide decks, legal briefs, and textbooks. OpenBook parses and chunks the text, generating dense embeddings for sub-second retrieval.",
    highlights: [
      "Deep text extraction & table comprehension",
      "Chunk-level source citations & page references",
      "Direct document viewer with side-by-side verification",
    ],
  },
  {
    id: "youtube",
    title: "YouTube Video Indexing",
    icon: <YoutubeIcon size={20} className="text-red-500" />,
    badge: "Transcript Sync",
    description:
      "Paste any YouTube video or lecture URL. OpenBook automatically pulls the complete closed captions and timestamps, allowing you to ask questions about spoken lectures.",
    highlights: [
      "Automatic transcript parsing across languages",
      "Timestamp grounding linking answers to video moments",
      "Ideal for podcasts, keynote speeches, and university courses",
    ],
  },
  {
    id: "web",
    title: "Live Web & Article Scraping",
    icon: <Globe className="w-5 h-5 text-blue-500" />,
    badge: "Firecrawl & Tavily",
    description:
      "Index technical documentation, blog posts, and news articles with clean markdown extraction, or toggle live Tavily web search to ground queries with current real-time web facts.",
    highlights: [
      "Zero-fluff article extraction removing ads and navigation",
      "Live web toggle directly inside the chat interface",
      "Cross-domain synthesis across multiple website sources",
    ],
  },
  {
    id: "text",
    title: "Markdown & Raw Notes",
    icon: <FileCode className="w-5 h-5 text-emerald-500" />,
    badge: "Instant Indexing",
    description:
      "Paste snippets, meeting notes, interview transcripts, or Markdown outlines directly into your workspace. Instant vectorization grounds your notes immediately.",
    highlights: [
      "Fast scratchpad for meeting notes and raw thoughts",
      "Full Markdown support including codeblocks and lists",
      "Seamlessly blends personal notes with external PDFs",
    ],
  },
];

export function SourcesShowcase() {
  const [activeSource, setActiveSource] = useState(SOURCE_FEATURES[0].id);
  const current = SOURCE_FEATURES.find((s) => s.id === activeSource) || SOURCE_FEATURES[0];

  return (
    <section id="sources" className="py-24 border-t border-border bg-card/20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Database className="w-3.5 h-3.5 text-foreground" />
            <span>Multimodal Ingestion</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Bring any source. Ground every answer.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Eliminate AI hallucinations. OpenBook connects directly to your verified materials
            and generates answers backed strictly by evidence.
          </p>
        </div>

        {/* Source Format Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-12">
          {SOURCE_FEATURES.map((src) => {
            const isActive = src.id === activeSource;
            return (
              <button
                key={src.id}
                onClick={() => setActiveSource(src.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isActive
                    ? "border-foreground bg-card shadow-md scale-[1.02]"
                    : "border-border bg-card/50 hover:bg-card hover:border-zinc-400 dark:hover:border-zinc-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-muted border border-border">
                    {src.icon}
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    {src.badge}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  {src.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Active Source Feature Display Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card p-6 sm:p-10 shadow-xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-muted text-xs font-semibold text-foreground">
              {current.icon}
              <span>{current.title}</span>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {current.description}
            </p>

            <div className="space-y-2.5 pt-2 border-t border-border">
              {current.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-foreground font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Graphic Preview Visual */}
          <div className="rounded-2xl border border-border bg-background p-5 space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pb-2 border-b border-border">
              <span className="flex items-center gap-1.5 text-foreground font-semibold">
                <Cpu className="w-3.5 h-3.5 text-foreground" />
                Pipeline Engine
              </span>
              <span className="text-emerald-500">READY</span>
            </div>

            <div className="space-y-2 text-[11px]">
              <div className="p-2 rounded-lg bg-muted/60 flex items-center justify-between">
                <span className="text-muted-foreground">Vector Store</span>
                <span className="text-foreground font-semibold">Pinecone Serverless</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/60 flex items-center justify-between">
                <span className="text-muted-foreground">Embedding Model</span>
                <span className="text-foreground font-semibold">text-embedding-3-small</span>
              </div>
              <div className="p-2 rounded-lg bg-muted/60 flex items-center justify-between">
                <span className="text-muted-foreground">Context Window</span>
                <span className="text-foreground font-semibold">120k Tokens Synthesized</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Strict RAG Guardrails: Zero hallucinations</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
