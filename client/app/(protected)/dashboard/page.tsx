"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth";
import { useWorkspaces, Workspace } from "@/hooks/use-workspaces";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useUsage, useUpgradeModal } from "@/features/billing";
import {
  DashboardHeader,
  DashboardBanner,
  WorkspacesGrid,
  CreateWorkspaceModal,
  EditWorkspaceModal,
} from "@/features/dashboard";

export default function DashboardPage() {
  const router = useRouter();
  const { session, isPending: isAuthPending, logoutMutation } = useAuth();
  const { plan, usage } = useUsage();
  const { openUpgradeModal } = useUpgradeModal();

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
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);

  // Pinned workspaces state (persisted in localStorage)
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

  // Handle redirect if not authenticated
  useEffect(() => {
    if (!isAuthPending && !session) {
      router.push("/login");
    }
  }, [session, isAuthPending, router]);

  const handleOpenCreateModal = () => {
    const wsLimit = usage?.workspaces.limit ?? (plan === "FREE" ? 1 : plan === "PRO" ? 3 : 10);
    if (workspaces.length >= wsLimit) {
      const nextPlan = plan === "FREE" ? "Pro (3 workspaces)" : "Pro+ (10 workspaces)";
      openUpgradeModal({
        reason: `${plan} plan limit reached: You have created ${wsLimit} of ${wsLimit} allowed workspaces. Upgrade to ${nextPlan} to create more.`,
        limitType: "workspaces",
      });
      return;
    }
    setIsCreateOpen(true);
  };

  const handleCreateWorkspace = async (title: string, description: string, icon: string) => {
    try {
      const created = await createWorkspace({
        title,
        description: description || undefined,
        icon,
      });
      setIsCreateOpen(false);
      if (created && (created as Workspace).id) {
        router.push(`/workspace/${(created as Workspace).id}`);
      }
    } catch (err) {
      console.error("Failed to create workspace:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("limit") || msg.includes("Free tier") || msg.includes("403")) {
        openUpgradeModal({
          reason: msg || "Plan limit reached. Upgrade for more workspaces.",
          limitType: "workspaces",
        });
      }
    }
  };

  const handleEditWorkspace = async (id: string, title: string, description: string, icon: string) => {
    try {
      await updateWorkspace({
        id,
        title,
        description: description || undefined,
        icon,
      });
      setEditingWorkspace(null);
    } catch (err) {
      console.error("Failed to update workspace:", err);
    }
  };

  const handleDeleteWorkspace = (ws: Workspace, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpenId(null);
    if (confirm(`Delete notebook "${ws.title}"?`)) {
      deleteWorkspace(ws.id);
    }
  };

  const handleOpenEdit = (ws: Workspace, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWorkspace(ws);
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
      return (
        new Date(b.updatedAt || b.createdAt).getTime() -
        new Date(a.updatedAt || a.createdAt).getTime()
      );
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
      {/* 1. Header Bar */}
      <DashboardHeader
        user={session.user}
        onLogout={() => logoutMutation.mutate()}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-10 space-y-8">
        {/* Welcome Banner & Search */}
        <DashboardBanner
          userName={session.user.name}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onNewNotebook={handleOpenCreateModal}
        />

        {/* Workspaces Grid */}
        <WorkspacesGrid
          workspaces={filteredWorkspaces}
          isLoading={isWorkspacesLoading}
          pinnedIds={pinnedIds}
          menuOpenId={menuOpenId}
          onMenuToggle={(id) => setMenuOpenId((prev) => (prev === id ? null : id))}
          onCreateClick={handleOpenCreateModal}
          onEdit={handleOpenEdit}
          onTogglePin={togglePin}
          onDelete={handleDeleteWorkspace}
        />
      </main>

      {/* 3. Create Workspace Modal */}
      <CreateWorkspaceModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateWorkspace}
        isCreating={isCreating}
      />

      {/* 4. Edit Workspace Modal */}
      <EditWorkspaceModal
        workspace={editingWorkspace}
        onClose={() => setEditingWorkspace(null)}
        onSubmit={handleEditWorkspace}
        isUpdating={isUpdating}
      />
    </div>
  );
}
