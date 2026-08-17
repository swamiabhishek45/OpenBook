"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, Settings } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useWorkspace, useWorkspaces } from "@/features/workspaces";

const NOTEBOOK_ICONS = [
  "📚",
  "🔬",
  "💻",
  "🧠",
  "📊",
  "⚡",
  "🎨",
  "📝",
  "🌐",
  "🎯",
  "🚀",
  "💡",
  "📌",
  "✨",
  "🔥",
  "🤖",
  "📖",
  "🎓",
  "🧪",
  "🛠️",
];

interface WorkspaceSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function WorkspaceSettingsPage({
  params,
}: WorkspaceSettingsPageProps) {
  const { workspaceId } = use(params);
  const router = useRouter();
  const { workspace, isLoading, updateWorkspace } = useWorkspace(workspaceId);
  const { deleteWorkspace } = useWorkspaces();

  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("📚");
  const [defaultModel, setDefaultModel] = useState("gpt-4o-mini");
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (workspace) {
      setTitle(workspace.title || "");
      setIcon(workspace.icon || "📚");
      setDefaultModel(workspace.defaultModel || "gpt-4o-mini");
    }
  }, [workspace]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateWorkspace({
      title: title.trim(),
      icon,
      defaultModel,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete "${workspace?.title}"? All sources, notes, and chats will be permanently removed.`
      )
    ) {
      await deleteWorkspace(workspaceId);
      router.push("/dashboard");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <ThemeLoader size={36} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border px-6 py-3.5 flex items-center justify-between bg-card">
        <Link
          href={`/workspace/${workspaceId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workspace Chat</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Workspace Settings
        </span>
      </div>

      <div className="flex-1 max-w-2xl mx-auto w-full p-6 md:p-8 space-y-8">
        <div>
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-foreground" />
            <h1 className="text-xl font-semibold text-foreground">Workspace Configuration</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage your workspace name, default grounding model, and lifecycle settings.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6 p-6 rounded-2xl border border-border bg-card">
          {/* Icon Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground flex items-center justify-between">
              <span>Notebook Icon</span>
              <span className="text-muted-foreground text-[11px]">Selected: {icon}</span>
            </label>
            <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-28 overflow-y-auto">
              {NOTEBOOK_ICONS.map((ic) => (
                <button
                  key={ic}
                  type="button"
                  onClick={() => setIcon(ic)}
                  className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer ${
                    icon === ic
                      ? "bg-primary text-primary-foreground border-2 border-primary scale-105 shadow-xs"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Workspace Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Default AI Model</label>
            <select
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="gpt-4o-mini">GPT-4o Mini (Fast &amp; Accurate RAG)</option>
              <option value="gpt-4o">GPT-4o (Deep Reasoning &amp; Complex Synthesis)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <span className="text-xs text-emerald-500 font-medium">
              {isSaved ? "Settings saved successfully!" : ""}
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-foreground text-background hover:opacity-90 transition-all shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>

        {/* Danger Zone */}
        <div className="p-6 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Deleting this workspace will permanently erase all uploaded PDFs, vector indexes, generated study artifacts, and message transcripts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
