"use client";

import { use } from "react";
import { WorkspacePageShell } from "@/features/workspaces/components/workspace-page-shell";
import { IntegrationsSettingsView } from "@/features/integrations";

export default function WorkspaceIntegrationsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <WorkspacePageShell workspaceId={workspaceId} sectionLabel="Integrations">
      <IntegrationsSettingsView workspaceId={workspaceId} />
    </WorkspacePageShell>
  );
}
