"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, OpenBookLogo } from "@/features/auth";
import { useWorkspaces, Workspace } from "@/hooks/use-workspaces";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  BookOpen,
  Plus,
  Search,
  LogOut,
  FolderPlus,
  Trash2,
  Sparkles,
  FileText,
  Clock,
  ChevronRight,
  User,
} from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isPending: isAuthPending, logoutMutation } = useAuth();
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    createWorkspace,
    isCreating,
    deleteWorkspace,
  } = useWorkspaces();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  // Handle redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/login");
    }
  }, [session, isAuthPending, router]);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      const created = await createWorkspace({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
      });
      setNewTitle("");
      setNewDescription("");
      setIsCreateOpen(false);
      if (created && (created as Workspace).id) {
        router.push(`/workspace/${(created as Workspace).id}`);
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  };

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (ws.description && ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (isAuthPending) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
        <ThemeLoader size={36} />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-muted">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <OpenBookLogo size={26} textSize="text-xl" textColor="text-foreground" />
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex items-center relative w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks..."
              className="w-full pl-9 pr-4 py-1.5 bg-muted/60 dark:bg-zinc-900 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-colors"
            />
          </div>
        </div>

        {/* User profile & actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary text-primary-foreground hover:opacity-90 rounded-lg text-xs font-medium transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notebook</span>
          </button>

          <ThemeToggle />

          <div className="h-4 w-px bg-border mx-1" />

          {/* User profile pill */}
          <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-card">
            <div className="w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground">
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5" />}
            </div>
            <span className="text-xs text-muted-foreground hidden sm:inline max-w-[120px] truncate">
              {session.user.name || session.user.email}
            </span>
            <button
              onClick={() => logoutMutation.mutate()}
              title="Sign out"
              className="p-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground font-sans">
              Welcome back, {session.user.name || "Explorer"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Organize your research, notes, and sources with AI-powered synthesis.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg border border-border bg-card text-xs text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>Model: GPT-4o-mini</span>
            </div>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Your Notebooks ({filteredWorkspaces.length})
            </h2>
          </div>

          {isWorkspacesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl border border-border bg-card animate-pulse p-5 space-y-3"
                >
                  <div className="h-5 w-32 bg-muted rounded" />
                  <div className="h-4 w-48 bg-muted/60 rounded" />
                  <div className="h-4 w-20 bg-muted/40 rounded mt-8" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Create New Notebook Card */}
              <button
                onClick={() => setIsCreateOpen(true)}
                className="group h-44 rounded-xl border border-dashed border-border hover:border-zinc-500 bg-card hover:bg-muted/40 p-5 flex flex-col items-center justify-center text-center transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-full border border-border group-hover:border-zinc-400 bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground transition-colors">
                  Create New Notebook
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Upload PDFs, audio, YouTube &amp; web links
                </span>
              </button>

              {/* Workspace Cards */}
              {filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="group relative h-44 rounded-xl border border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-card hover:bg-muted/30 p-5 flex flex-col justify-between transition-all duration-200 shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <Link
                          href={`/workspace/${ws.id}`}
                          className="font-medium text-sm text-foreground hover:underline line-clamp-1"
                        >
                          {ws.title}
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          if (confirm(`Delete notebook "${ws.title}"?`)) {
                            deleteWorkspace(ws.id);
                          }
                        }}
                        title="Delete notebook"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2.5 line-clamp-2 leading-relaxed">
                      {ws.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(ws.updatedAt || ws.createdAt)}
                    </span>

                    <Link
                      href={`/workspace/${ws.id}`}
                      className="flex items-center gap-1 text-foreground font-medium hover:underline"
                    >
                      <span>Open</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-zinc-300" />
                <h3 className="text-base font-semibold text-white">Create New Notebook</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Quantum Computing Research"
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief summary of what this notebook is about..."
                  className="w-full px-3.5 py-2 rounded-lg border border-zinc-800 bg-zinc-950 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-zinc-800 text-xs font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  {isCreating ? <ThemeLoader size={16} /> : null}
                  <span>Create Notebook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
