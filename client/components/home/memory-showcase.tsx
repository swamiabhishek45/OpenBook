"use client";

import React from "react";
import { Brain, Sparkles, Check, ArrowRight, Lightbulb, User, Shield } from "lucide-react";
import Link from "next/link";

export function MemoryShowcase() {
  const memoryItems = [
    {
      type: "STUDY PREFERENCE",
      text: "Prefers concise, code-first explanations in TypeScript and Next.js rather than abstract theory.",
      timestamp: "Saved from Session 1",
    },
    {
      type: "DOMAIN CONTEXT",
      text: "Working on a machine learning thesis exploring RAG optimization for legal contracts.",
      timestamp: "Saved from Session 3",
    },
    {
      type: "ROLE / BACKGROUND",
      text: "Senior Software Engineer with deep background in distributed databases and Kubernetes.",
      timestamp: "Custom User Fact",
    },
  ];

  return (
    <section id="memory" className="py-24 border-t border-border bg-card/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Text description */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>Personalized Memory Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-[1.15]">
              An AI notebook that truly remembers you.
            </h2>

            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed font-normal">
              Unlike ordinary chat models that start blank with every message, OpenBook builds a
              personalized knowledge profile across your notebooks. It recalls your expertise,
              study preferences, and project background.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Cross-Notebook Retention</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Insights learned in one research notebook seamlessly inform future study sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-purple-500/10 text-purple-500 shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-foreground">Full Privacy &amp; Control</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    View, add, edit, or delete any recorded memory anytime in your settings dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Memory Card Stack */}
          <div className="lg:col-span-6 space-y-4">
            <div className="rounded-3xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-500" />
                  <h3 className="text-sm font-semibold text-foreground">Active Memory Profile</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-medium">
                  3 Memories Active
                </span>
              </div>

              <div className="space-y-3">
                {memoryItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-border bg-muted/40 hover:bg-muted/70 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                      <span className="font-semibold text-purple-500">{item.type}</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      &quot;{item.text}&quot;
                    </p>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl border border-border bg-background text-[11px] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                  <span>Responses auto-tailored to your style</span>
                </span>
                <span className="text-emerald-500 font-semibold">Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
