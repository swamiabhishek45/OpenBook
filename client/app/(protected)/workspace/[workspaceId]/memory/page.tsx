"use client";

import { use } from "react";
import { WorkspacePageShell } from "@/features/workspaces/components/workspace-page-shell";
import { MemorySettingsView } from "@/features/memory";

export default function WorkspaceMemoryPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <WorkspacePageShell workspaceId={workspaceId} sectionLabel="Memory">
      <MemorySettingsView workspaceId={workspaceId} />
    </WorkspacePageShell>
  );
}
