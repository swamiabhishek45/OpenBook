"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  ChevronRight,
  User,
  MoreVertical,
  Edit3,
  Pin,
} from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { GooeyInput } from "@/components/ui/gooey-input";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

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

export default function DashboardPage() {
  const router = useRouter();
  const { session, isPending: isAuthPending, logoutMutation } = useAuth();
  const {
    workspaces,
    isLoading: isWorkspacesLoading,
    createWorkspace,
    isCreating,
    updateWorkspace,
    isUpdating,
    deleteWorkspace,
  } = useWorkspaces();

  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState("📚");

  // Edit Modal State
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editIcon, setEditIcon] = useState("📚");

  // Three-dot menu open state
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Pinned workspaces state (persisted in localStorage)
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("pinned_notebooks");
      if (stored) {
        setPinnedIds(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const togglePin = (workspaceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setPinnedIds((prev) => {
      const next = prev.includes(workspaceId)
        ? prev.filter((id) => id !== workspaceId)
        : [workspaceId, ...prev];
      try {
        localStorage.setItem("pinned_notebooks", JSON.stringify(next));
      } catch {}
      return next;
    });
    setMenuOpenId(null);
  };

  // Close three-dot menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpenId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle redirect if not authenticated
  useEffect(() => {
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
        icon: newIcon,
      });
      setNewTitle("");
      setNewDescription("");
      setNewIcon("📚");
      setIsCreateOpen(false);
      if (created && (created as Workspace).id) {
        router.push(`/workspace/${(created as Workspace).id}`);
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  };

  const handleEditWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWorkspace || !editTitle.trim()) return;

    try {
      await updateWorkspace({
        id: editingWorkspace.id,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        icon: editIcon,
      });
      setEditingWorkspace(null);
    } catch (err) {
      console.error("Failed to update workspace:", err);
    }
  };

  const openEditModal = (ws: Workspace, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setEditingWorkspace(ws);
    setEditTitle(ws.title);
    setEditDescription(ws.description || "");
    setEditIcon(ws.icon || "📚");
    setMenuOpenId(null);
  };

  // Filter & sort: Pinned workspaces come first
  const filteredWorkspaces = [...workspaces]
    .filter(
      (ws) =>
        ws.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ws.description &&
          ws.description.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      const aPinned = pinnedIds.includes(a.id);
      const bPinned = pinnedIds.includes(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    });

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
        </div>

        {/* User profile & theme actions */}
        <div className="flex items-center gap-3">
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
              className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Welcome Banner with Gooey Search on right next to + New Notebook button */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground font-sans">
              Welcome back, {session.user.name || "Explorer"}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Organize your research, notes, and sources with AI-powered synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <GooeyInput
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notebooks..."
            />

            <button
              onClick={() => {
                setNewTitle("");
                setNewDescription("");
                setNewIcon("📚");
                setIsCreateOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 active:scale-95 rounded-xl text-xs font-medium transition-all shadow-xs shrink-0 cursor-pointer h-10"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New Notebook</span>
            </button>
          </div>
        </div>

        {/* Workspaces Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold tracking-wider text-muted-foreground uppercase">
              Your Workspaces ({filteredWorkspaces.length})
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
                onClick={() => {
                  setNewTitle("");
                  setNewDescription("");
                  setNewIcon("📚");
                  setIsCreateOpen(true);
                }}
                className="group h-44 rounded-xl border border-dashed border-border hover:border-zinc-500 bg-card hover:bg-muted/40 p-5 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full border border-border group-hover:border-zinc-400 bg-muted flex items-center justify-center text-muted-foreground group-hover:text-foreground transition-colors mb-3">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium text-foreground transition-colors">
                  Create New Workspace
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  Upload PDFs, audio, YouTube &amp; web links
                </span>
              </button>

              {/* Workspace Cards */}
              {filteredWorkspaces.map((ws) => {
                const isPinned = pinnedIds.includes(ws.id);
                const isMenuOpen = menuOpenId === ws.id;

                return (
                  <div
                    key={ws.id}
                    className={cn(
                      "group relative h-44 rounded-xl border bg-card p-5 flex flex-col justify-between transition-all duration-200 shadow-xs",
                      isPinned
                        ? "border-primary/40 bg-card hover:border-primary/60"
                        : "border-border hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-muted/30"
                    )}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center text-base shrink-0">
                            {ws.icon || "📚"}
                          </div>
                          <div className="min-w-0 flex-1 flex items-center gap-1.5">
                            <Link
                              href={`/workspace/${ws.id}`}
                              className="font-medium text-sm text-foreground hover:underline truncate"
                            >
                              {ws.title}
                            </Link>
                            {isPinned && (
                              <Pin className="w-3 h-3 text-primary fill-primary shrink-0 rotate-45" />
                            )}
                          </div>
                        </div>

                        {/* Three Dots Menu Container */}
                        <div className="relative shrink-0" ref={isMenuOpen ? menuRef : undefined}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpenId(isMenuOpen ? null : ws.id);
                            }}
                            title="Notebook actions"
                            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {/* Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-border bg-card shadow-xl py-1.5 z-40 text-xs text-foreground animate-fadeIn">
                              <button
                                type="button"
                                onClick={(e) => openEditModal(ws, e)}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>Edit Notebook</span>
                              </button>

                              <button
                                type="button"
                                onClick={(e) => togglePin(ws.id, e)}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-muted transition-colors"
                              >
                                <Pin className="w-3.5 h-3.5 text-muted-foreground" />
                                <span>{isPinned ? "Unpin from top" : "Pin to top"}</span>
                              </button>

                              <div className="h-px bg-border my-1" />

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setMenuOpenId(null);
                                  if (confirm(`Delete notebook "${ws.title}"?`)) {
                                    deleteWorkspace(ws.id);
                                  }
                                }}
                                className="w-full px-3 py-2 text-left flex items-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
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
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Create Workspace Modal with Icon Picker on top */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-semibold text-foreground">Create New Workspace</h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWorkspace} className="space-y-4">
              {/* Icon Picker Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Workspace Icon</span>
                  <span className="text-muted-foreground text-[11px]">Selected: {newIcon}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-28 overflow-y-auto">
                  {NOTEBOOK_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewIcon(icon)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer",
                        newIcon === icon
                          ? "bg-primary text-primary-foreground border-2 border-primary scale-105 shadow-xs"
                          : "hover:bg-muted border border-transparent"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Quantum Computing Research"
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief summary of what this notebook is about..."
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isCreating ? <ThemeLoader size={16} /> : null}
                  <span>Create Notebook</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Workspace Modal */}
      {editingWorkspace && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn text-foreground">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-foreground" />
                <h3 className="text-base font-semibold text-foreground">Edit Notebook</h3>
              </div>
              <button
                onClick={() => setEditingWorkspace(null)}
                className="text-muted-foreground hover:text-foreground text-xs p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditWorkspace} className="space-y-4">
              {/* Icon Picker Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center justify-between">
                  <span>Notebook Icon</span>
                  <span className="text-muted-foreground text-[11px]">Selected: {editIcon}</span>
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 rounded-xl border border-border bg-muted/30 max-h-28 overflow-y-auto">
                  {NOTEBOOK_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditIcon(icon)}
                      className={cn(
                        "w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-all cursor-pointer",
                        editIcon === icon
                          ? "bg-primary text-primary-foreground border-2 border-primary scale-105 shadow-xs"
                          : "hover:bg-muted border border-transparent"
                      )}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Title</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Notebook Title"
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Description Field */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Description (Optional)</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Notebook Description"
                  className="w-full px-3.5 py-2 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingWorkspace(null)}
                  className="px-3.5 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editTitle.trim()}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:opacity-90 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {isUpdating ? <ThemeLoader size={16} /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

