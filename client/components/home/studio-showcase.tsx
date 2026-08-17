"use client";

import React, { useState } from "react";
import {
  BookOpen,
  ListChecks,
  Layers,
  HelpCircle,
  Network,
  FileText,
  Sparkles,
  ArrowRight,
  RotateCw,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function StudioShowcase() {
  const [activeTool, setActiveTool] = useState<"flashcards" | "quiz" | "mindmap" | "summary" | "takeaways">("flashcards");
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);

  return (
    <section id="studio" className="py-24 border-t border-border bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span>Studio Learning Artifacts</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            Generate powerful study tools in one click.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Transform thousands of pages of raw notes into interactive study decks,
            structured concept trees, and active-recall quizzes.
          </p>
        </div>

        {/* Studio Tool Selection Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto mb-10">
          <button
            onClick={() => setActiveTool("flashcards")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTool === "flashcards"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Flashcards</span>
          </button>

          <button
            onClick={() => setActiveTool("quiz")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTool === "quiz"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Practice Quiz</span>
          </button>

          <button
            onClick={() => setActiveTool("mindmap")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTool === "mindmap"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Mind Map</span>
          </button>

          <button
            onClick={() => setActiveTool("takeaways")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTool === "takeaways"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <ListChecks className="w-3.5 h-3.5" />
            <span>Key Takeaways</span>
          </button>

          <button
            onClick={() => setActiveTool("summary")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
              activeTool === "summary"
                ? "bg-foreground text-background border-foreground shadow-sm"
                : "bg-card text-muted-foreground border-border hover:text-foreground"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>AI Summary</span>
          </button>
        </div>

        {/* Live Interactive Sandbox Card */}
        <div className="max-w-4xl mx-auto rounded-3xl border border-border bg-card shadow-2xl p-6 sm:p-10 min-h-[380px] flex flex-col justify-center select-none">
          {/* 1. Flashcards Demo */}
          {activeTool === "flashcards" && (
            <div className="max-w-md mx-auto w-full space-y-4 text-center">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full h-56 rounded-2xl border border-border bg-muted/40 p-6 flex flex-col justify-between items-center cursor-pointer hover:border-zinc-400 dark:hover:border-zinc-600 transition-all shadow-md active:scale-[0.99]"
              >
                <div className="flex items-center justify-between w-full text-[11px] text-muted-foreground">
                  <span className="font-semibold uppercase tracking-wider">Concept Card</span>
                  <span className="flex items-center gap-1 text-primary">
                    <RotateCw className="w-3 h-3" />
                    <span>Click to flip</span>
                  </span>
                </div>

                <div className="py-2">
                  {!isFlipped ? (
                    <p className="text-base sm:text-lg font-semibold text-foreground leading-snug">
                      What is the difference between Dense Passage Retrieval (DPR) and Sparse BM25?
                    </p>
                  ) : (
                    <p className="text-xs sm:text-sm text-foreground leading-relaxed animate-fadeIn">
                      <strong>BM25</strong> matches exact keyword tokens and frequencies, whereas{" "}
                      <strong>DPR</strong> maps queries and passages into high-dimensional vector space to capture semantic meaning.
                    </p>
                  )}
                </div>

                <span className="text-[10px] text-muted-foreground">
                  {isFlipped ? "Showing Answer" : "Showing Question"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Flip through study decks generated directly from your PDFs &amp; lecture notes.
              </p>
            </div>
          )}

          {/* 2. Practice Quiz Demo */}
          {activeTool === "quiz" && (
            <div className="max-w-lg mx-auto w-full space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground pb-2 border-b border-border">
                <span className="font-semibold text-foreground">Question 1 of 5</span>
                <span className="font-mono text-[10px]">Instant AI Scoring</span>
              </div>

              <h3 className="text-sm font-semibold text-foreground">
                Which vector search algorithm performs hierarchical graph navigation for sub-millisecond similarity search?
              </h3>

              <div className="space-y-2 text-xs">
                {[
                  "K-Means Clustering",
                  "Hierarchical Navigable Small World (HNSW)",
                  "Inverted Document Index (IDF)",
                  "Principal Component Analysis (PCA)",
                ].map((opt, idx) => {
                  const isSelected = selectedQuizAnswer === idx;
                  const isCorrect = idx === 1;

                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedQuizAnswer(idx)}
                      className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        selectedQuizAnswer === null
                          ? "border-border bg-muted/40 hover:bg-muted"
                          : isSelected
                          ? isCorrect
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                            : "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-semibold"
                          : isCorrect
                          ? "border-emerald-500/50 bg-emerald-500/5 text-muted-foreground"
                          : "border-border bg-muted/20 opacity-60"
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedQuizAnswer !== null && isSelected && (
                        <span>
                          {isCorrect ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {selectedQuizAnswer !== null && (
                <div className="p-3 rounded-xl border border-border bg-muted/50 text-xs text-muted-foreground animate-fadeIn leading-relaxed">
                  <strong>Explanation:</strong> HNSW creates a multi-layer graph structure where upper layers allow fast highway traversal and bottom layers pinpoint nearest vector neighbors.
                </div>
              )}
            </div>
          )}

          {/* 3. Mind Map Demo */}
          {activeTool === "mindmap" && (
            <div className="max-w-2xl mx-auto w-full py-4 space-y-4">
              <div className="flex items-center gap-4 text-xs justify-center">
                <div className="p-3.5 rounded-xl bg-foreground text-background font-bold shadow-md">
                  Distributed Systems
                </div>
                <div className="h-0.5 w-8 bg-border" />
                <div className="space-y-3">
                  <div className="p-2.5 rounded-lg border border-border bg-card text-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Consensus Protocols (Raft &amp; Paxos)</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-card text-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>CAP Theorem &amp; Eventual Consistency</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-border bg-card text-foreground font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Vector Clocks &amp; Conflict Resolution</span>
                  </div>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground pt-2">
                Click nodes to expand or collapse deep concept hierarchies in real-time.
              </p>
            </div>
          )}

          {/* 4. Takeaways Demo */}
          {activeTool === "takeaways" && (
            <div className="max-w-xl mx-auto w-full space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
                <p className="font-semibold text-foreground">📌 1. Zero-shot Retrieval Accuracy</p>
                <p className="text-muted-foreground leading-relaxed">
                  Hybrid dense-sparse retrieval achieves up to 40% higher precision on technical terminology compared to standalone keyword search.
                </p>
              </div>
              <div className="p-3.5 rounded-xl border border-border bg-muted/30 space-y-2">
                <p className="font-semibold text-foreground">📌 2. Dynamic Source Verification</p>
                <p className="text-muted-foreground leading-relaxed">
                  Each generated takeaway is linked to verified passages across PDF and YouTube sources.
                </p>
              </div>
            </div>
          )}

          {/* 5. Summary Demo */}
          {activeTool === "summary" && (
            <div className="max-w-xl mx-auto w-full space-y-3 text-xs">
              <div className="p-4 rounded-xl border border-border bg-muted/30 space-y-2 leading-relaxed text-muted-foreground">
                <h4 className="text-sm font-semibold text-foreground">Executive Overview: Quantum Error Correction</h4>
                <p>
                  Quantum error correction (QEC) protects quantum information from decoherence and noise by encoding logical qubits across multiple physical qubits using surface codes. Recent breakthroughs demonstrate fault-tolerant threshold operations below 0.1% error rates.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
