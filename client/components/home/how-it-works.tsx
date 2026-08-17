"use client";

import React from "react";
import { UploadCloud, MessageSquareText, Sparkles, ArrowRight } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      number: "01",
      icon: <UploadCloud className="w-6 h-6 text-foreground" />,
      title: "Add Your Sources",
      description:
        "Drop PDFs, paste YouTube video URLs, or enter website links. OpenBook parses, extracts text, and vectorizes content in seconds.",
    },
    {
      number: "02",
      icon: <MessageSquareText className="w-6 h-6 text-foreground" />,
      title: "Chat with Grounded RAG",
      description:
        "Ask complex cross-source questions. Receive synthesized answers grounded in your notes with real citations.",
    },
    {
      number: "03",
      icon: <Sparkles className="w-6 h-6 text-foreground" />,
      title: "Study & Generate Artifacts",
      description:
        "Generate active-recall flashcards, interactive quizzes, visual mind map trees, and executive summaries with one click.",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-border bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Workflow</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-foreground">
            From raw content to mastery in 3 steps.
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A seamless workflow designed for researchers, engineers, students, and lifelong learners.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-8 rounded-3xl border border-border bg-card shadow-lg hover:border-zinc-400 dark:hover:border-zinc-600 transition-all flex flex-col justify-between space-y-6 relative group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:scale-105 transition-transform">
                    {step.icon}
                  </div>
                  <span className="font-mono text-2xl font-bold text-muted-foreground/40">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-foreground">
                  {step.title}
                </h3>

                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-border/60 text-xs font-semibold text-muted-foreground flex items-center gap-1 group-hover:text-foreground transition-colors">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
