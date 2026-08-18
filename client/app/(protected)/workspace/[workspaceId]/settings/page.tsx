"use client";

import React, { use, useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Trash2, Save, Settings, ChevronDown, Check } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useWorkspace, useWorkspaces, NotebookIconPicker } from "@/features/workspaces";
import { cn } from "@/lib/utils";

const MODEL_OPTIONS = [
  {
    id: "gpt-4o-mini",
    title: "GPT-4o Mini",
    desc: "Fast & Accurate RAG with rapid response times",
  },
  {
    id: "gpt-4o",
    title: "GPT-4o",
    desc: "Deep Reasoning & Complex Multi-source Synthesis",
  },
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
  const [isModelOpen, setIsModelOpen] = useState(false);
  const modelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setIsModelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <NotebookIconPicker value={icon} onChange={setIcon} label="Notebook Icon" />


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

          <div className="space-y-1.5" ref={modelRef}>
            <label className="text-xs font-medium text-foreground">Default AI Model</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelOpen(!isModelOpen)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-border bg-background hover:bg-muted/40 text-foreground flex items-center justify-between transition-colors cursor-pointer text-left"
              >
                <div>
                  <span className="font-semibold block text-xs">
                    {MODEL_OPTIONS.find((m) => m.id === defaultModel)?.title || defaultModel}
                  </span>
                  <span className="text-[11px] text-muted-foreground block mt-0.5">
                    {MODEL_OPTIONS.find((m) => m.id === defaultModel)?.desc}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200 shrink-0",
                    isModelOpen && "rotate-180"
                  )}
                />
              </button>

              {isModelOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-full rounded-xl border border-border bg-card shadow-2xl p-1.5 z-30 animate-fadeIn space-y-1">
                  {MODEL_OPTIONS.map((opt) => {
                    const isSelected = opt.id === defaultModel;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setDefaultModel(opt.id);
                          setIsModelOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between p-2.5 rounded-lg text-left transition-colors cursor-pointer",
                          isSelected
                            ? "bg-foreground text-background font-semibold"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div>
                          <p className="text-xs font-medium">{opt.title}</p>
                          <p
                            className={cn(
                              "text-[11px] mt-0.5",
                              isSelected ? "text-background/80" : "text-muted-foreground"
                            )}
                          >
                            {opt.desc}
                          </p>
                        </div>
                        {isSelected && <Check className="w-4 h-4 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
