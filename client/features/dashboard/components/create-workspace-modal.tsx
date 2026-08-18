"use client";

import React, { useState } from "react";
import { FolderPlus } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { NotebookIconPicker } from "@/features/workspaces";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, description: string, icon: string) => Promise<void>;
  isCreating: boolean;
}

export function CreateWorkspaceModal({
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}: CreateWorkspaceModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📚");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await onSubmit(title.trim(), description.trim(), icon);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn text-foreground">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-foreground" />
            <h3 className="text-base font-semibold text-foreground">Create New Workspace</h3>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xs p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shared Icon Picker */}
          <NotebookIconPicker value={icon} onChange={setIcon} label="Workspace Icon" />

          {/* Title Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Title</label>
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Quantum Computing Research"
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Description Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Description (Optional)</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of what this notebook is about..."
              className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !title.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              {isCreating ? <ThemeLoader size={16} /> : null}
              <span>Create Notebook</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
