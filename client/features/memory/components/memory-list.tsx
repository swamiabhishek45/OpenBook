"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Edit2, Check, X, Brain, Sparkles } from "lucide-react";
import type { AppMemory } from "../lib/types";
import { useMemories } from "../hooks/use-memories";
import { cn } from "@/lib/utils";

interface MemoryListProps {
  memories: AppMemory[];
}

export function MemoryList({ memories }: MemoryListProps) {
  const { deleteMemory, updateMemory } = useMemories();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleStartEdit = (memory: AppMemory) => {
    setEditingId(memory.id);
    setEditText(memory.memory);
  };

  const handleSaveEdit = async (memoryId: string) => {
    if (!editText.trim()) return;
    await updateMemory.mutateAsync({
      memoryId,
      input: { memory: editText.trim() },
    });
    setEditingId(null);
  };

  if (memories.length === 0) {
    return (
      <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-card space-y-2">
        <Brain className="w-8 h-8 text-muted-foreground mx-auto" />
        <p className="text-xs font-medium text-foreground">No memories recorded yet</p>
        <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
          As you converse with your notebooks, Memory automatically learns your preferences and domain insights, or you can add custom facts above.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {memories.map((memory) => {
        const isEditing = editingId === memory.id;

        return (
          <div
            key={memory.id}
            className="p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-all flex flex-col gap-2 group"
          >
            <div className="flex items-start justify-between gap-3">
              {isEditing ? (
                <div className="flex-1 space-y-2">
                  <textarea
                    rows={2}
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(memory.id)}
                      disabled={updateMemory.isPending}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-foreground text-background"
                    >
                      <Check className="w-3 h-3" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-2.5 py-1 text-[11px] rounded-md border border-border text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-foreground leading-relaxed flex-1 whitespace-pre-wrap">
                  {memory.memory}
                </p>
              )}

              {!isEditing && (
                <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(memory)}
                    title="Edit memory"
                    className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Delete this memory fact?")) {
                        deleteMemory.mutate(memory.id);
                      }
                    }}
                    title="Delete memory"
                    className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground border-t border-border/40 pt-2 mt-1">
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[9px] font-medium uppercase",
                  memory.source === "learned"
                    ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    : "bg-muted text-foreground border border-border"
                )}
              >
                {memory.source === "learned" ? "AI Inferred" : "Manual"}
              </span>
              <span>·</span>
              <span>
                {formatDistanceToNow(new Date(memory.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
