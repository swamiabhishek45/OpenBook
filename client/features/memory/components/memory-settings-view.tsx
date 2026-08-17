"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Brain, Plus } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useMemories } from "../hooks/use-memories";
import { MemoryList } from "./memory-list";
import { AddMemoryDialog } from "./add-memory-dialog";

export function MemorySettingsView() {
  const { memories, isLoading } = useMemories();
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <Link
            href="/dashboard"
            className="p-2 rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-foreground" />
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                Personalized Memory &amp; Insights
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Mem0 long-term memory engine personalizes study notes and answers based on your background and past sessions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90 active:scale-[0.99] transition-all shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Memory Fact
        </button>
      </div>

      {/* Memory Content */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12 text-muted-foreground gap-3">
          <ThemeLoader size={32} />
          <span className="text-xs">Loading memory profile...</span>
        </div>
      ) : (
        <MemoryList memories={memories} />
      )}

      {/* Add Memory Dialog */}
      <AddMemoryDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
