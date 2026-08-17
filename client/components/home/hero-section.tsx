"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Globe,
  Brain,
  Layers,
  BookOpen,
  CheckCircle2,
  ListChecks,
  Network,
  HelpCircle,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export function HeroSection({ isAuthenticated = false }: HeroSectionProps) {
  const [activeTab, setActiveTab] = useState<"chat" | "mindmap" | "flashcard">("chat");

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Ambient Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/80 backdrop-blur-xs text-xs font-medium text-muted-foreground mb-8 shadow-xs animate-fadeIn">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-foreground font-semibold">OpenBook 2.0</span>
          <span>•</span>
          <span>Next-Gen Grounded NotebookLM</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-foreground max-w-5xl mx-auto leading-[1.12]">
          Turn your documents and media into{" "}
          <span className="underline decoration-zinc-400 dark:decoration-zinc-600 underline-offset-8">
            grounded intelligence
          </span>
          .
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
          Upload PDFs, websites, and YouTube videos. Chat with verified factual citations,
          generate study flashcards, interactive mind maps, and personalize responses with long-term memory.
        </p>

        {/* Action Buttons */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all shadow-md active:scale-[0.99]"
          >
            <span>{isAuthenticated ? "Open Your Workspace" : "Start Exploring Free"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#studio"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-all shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-muted-foreground" />
            <span>Explore Studio Tools</span>
          </a>
        </div>

        {/* Quick Format Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60">
            <FileText className="w-3.5 h-3.5 text-red-500" />
            PDF &amp; Markdown
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60">
            <YoutubeIcon size={14} className="text-red-500" />
            YouTube Transcripts
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60">
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            Deep Web Scraping
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card/60">
            <Brain className="w-3.5 h-3.5 text-purple-500" />
            Persistent Memory
          </span>
        </div>

        {/* Product Interactive Workspace Mockup Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-3xl border border-border bg-card shadow-2xl overflow-hidden text-left select-none transition-all">
          {/* Mockup Header Window Bar */}
          <div className="px-4 py-3 border-b border-border bg-muted/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-amber-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
              <span className="ml-2 text-xs font-medium text-muted-foreground">
                🔬 AI &amp; Quantum Computing Research · OpenBook
              </span>
            </div>

            {/* Interactive Preview Tabs */}
            <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border text-[11px]">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "chat"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Grounded Chat
              </button>
              <button
                onClick={() => setActiveTab("mindmap")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "mindmap"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Mind Map
              </button>
              <button
                onClick={() => setActiveTab("flashcard")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  activeTab === "flashcard"
                    ? "bg-card text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Study Cards
              </button>
            </div>
          </div>

          {/* Mockup Workspace 3-Column Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 min-h-[380px] bg-background">
            {/* Left Sources List */}
            <div className="hidden md:block md:col-span-3 border-r border-border p-4 space-y-3 bg-card/30">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Sources (3)</span>
                <span className="text-[10px] text-emerald-500 font-medium">● 3 active</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl border border-border bg-card flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-red-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">Quantum_Supremacy.pdf</p>
                    <p className="text-[10px] text-muted-foreground">18 Pages · Indexed</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card flex items-center gap-2.5">
                  <YoutubeIcon size={16} className="text-red-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">MIT Quantum Lecture #4</p>
                    <p className="text-[10px] text-muted-foreground">Video Transcript</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl border border-border bg-card flex items-center gap-2.5">
                  <Globe className="w-4 h-4 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-foreground truncate">nature.com/articles/q42</p>
                    <p className="text-[10px] text-muted-foreground">Web Article</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Tab Content */}
            <div className="col-span-1 md:col-span-6 p-5 flex flex-col justify-between space-y-4">
              {activeTab === "chat" && (
                <div className="space-y-4">
                  {/* User message */}
                  <div className="flex justify-end">
                    <div className="bg-foreground text-background text-xs px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-sm">
                      How do superconducting qubits differ from trapped-ion systems?
                    </div>
                  </div>

                  {/* AI Grounded response */}
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5 text-foreground" />
                    </div>
                    <div className="space-y-2 text-xs text-foreground bg-card border border-border p-3.5 rounded-2xl rounded-tl-xs max-w-md">
                      <p className="leading-relaxed">
                        Based on <span className="font-semibold text-primary underline">Quantum_Supremacy.pdf</span> and the <span className="font-semibold text-primary underline">MIT Lecture</span>:
                      </p>
                      <ul className="list-disc pl-4 space-y-1 text-muted-foreground">
                        <li><strong>Superconducting Qubits:</strong> Faster gate operation speeds (~10-100ns) but require cryogenic cooling at 15mK.</li>
                        <li><strong>Trapped-Ion:</strong> Longer coherence times (seconds to minutes) with high fidelity, though operation speeds are slower.</li>
                      </ul>
                      <div className="flex items-center gap-1 text-[10px] text-emerald-500 pt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>100% Grounded in 3 indexed sources</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "mindmap" && (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="flex items-center gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-foreground text-background font-semibold shadow-md">
                      Quantum Computing
                    </div>
                    <div className="h-0.5 w-6 bg-muted-foreground" />
                    <div className="space-y-3">
                      <div className="p-2 rounded-lg bg-card border border-border text-foreground font-medium">
                        Superconducting (IBM, Google)
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border text-foreground font-medium">
                        Trapped Ion (IonQ, Quantinuum)
                      </div>
                      <div className="p-2 rounded-lg bg-card border border-border text-foreground font-medium">
                        Photonic (Xanadu, PsiQuantum)
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "flashcard" && (
                <div className="h-full flex items-center justify-center p-4">
                  <div className="w-full max-w-sm p-6 rounded-2xl border border-border bg-card text-center space-y-3 shadow-lg">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Flashcard 1 of 8
                    </span>
                    <h3 className="text-sm font-semibold text-foreground">
                      What is the primary cause of decoherence in superconducting circuits?
                    </h3>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      Click to reveal: Dielectric loss in substrate interfaces and stray electromagnetic radiation.
                    </p>
                  </div>
                </div>
              )}

              {/* Chat Input Bar Preview */}
              <div className="p-2.5 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-foreground" />
                  <span>3 sources grounded · Ask anything...</span>
                </span>
                <span className="w-6 h-6 rounded-lg bg-foreground text-background flex items-center justify-center">
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>

            {/* Right Studio Tools List */}
            <div className="hidden md:block md:col-span-3 border-l border-border p-4 space-y-3 bg-card/30">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <span>Studio</span>
                <span className="font-mono text-[10px] text-muted-foreground">6 Tools</span>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-medium">Synthesis Summary</span>
                </div>
                <div className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  <ListChecks className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-medium">Key Takeaways</span>
                </div>
                <div className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-medium">Flashcard Deck</span>
                </div>
                <div className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  <HelpCircle className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-medium">Practice Quiz</span>
                </div>
                <div className="p-2 rounded-lg border border-border bg-card flex items-center gap-2">
                  <Network className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-medium">Mind Map Graph</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
