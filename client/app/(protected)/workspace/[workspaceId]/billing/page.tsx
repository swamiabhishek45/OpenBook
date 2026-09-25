"use client";

import { use } from "react";
import { WorkspacePageShell } from "@/features/workspaces/components/workspace-page-shell";
import { BillingSettingsView } from "@/features/billing";

export default function WorkspaceBillingPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = use(params);

  return (
    <WorkspacePageShell workspaceId={workspaceId} sectionLabel="Billing & Plan">
      <BillingSettingsView workspaceId={workspaceId} />
    </WorkspacePageShell>
  );
}
