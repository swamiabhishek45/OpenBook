import { SourceLibrary } from "@/features/sources";
import { WorkspacePageShell } from "@/features/workspaces/components/workspace-page-shell";

interface WorkspaceSourcesPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceSourcesPage({
  params,
}: WorkspaceSourcesPageProps) {
  const { workspaceId } = await params;

  return (
    <WorkspacePageShell workspaceId={workspaceId} sectionLabel="Library">
      <SourceLibrary workspaceId={workspaceId} />
    </WorkspacePageShell>
  );
}
