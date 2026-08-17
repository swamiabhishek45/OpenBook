"use client";

import React, { useState } from "react";
import { Plus, X, Brain } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useMemories } from "../hooks/use-memories";

interface AddMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddMemoryDialog({ open, onOpenChange }: AddMemoryDialogProps) {
  const [memoryText, setMemoryText] = useState("");
  const [infer, setInfer] = useState(false);
  const { createMemory } = useMemories();

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memoryText.trim()) return;

    await createMemory.mutateAsync({
      memory: memoryText.trim(),
      infer,
    });
    setMemoryText("");
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden animate-fadeIn text-foreground">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Add Custom Memory</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Memory Fact / Preference</label>
            <textarea
              rows={4}
              required
              value={memoryText}
              onChange={(e) => setMemoryText(e.target.value)}
              placeholder="e.g., I prefer TypeScript code examples with strict typing and concise explanations."
              className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
            <p className="text-[11px] text-muted-foreground">
              Mem0 will store this fact and personalize AI responses across your workspaces.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-3.5 py-1.5 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMemory.isPending || !memoryText.trim()}
              className="px-4 py-1.5 bg-foreground hover:opacity-90 text-background text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              {createMemory.isPending ? <ThemeLoader size={16} /> : <Plus className="w-3.5 h-3.5" />}
              <span>Save Memory</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
