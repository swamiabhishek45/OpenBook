import { SourceDetail } from "@/features/sources";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface WorkspaceSourceDetailPageProps {
  params: Promise<{
    workspaceId: string;
    sourceId: string;
  }>;
}

export default async function WorkspaceSourceDetailPage({
  params,
}: WorkspaceSourceDetailPageProps) {
  const { workspaceId, sourceId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border px-6 py-3.5 flex items-center justify-between bg-card">
        <Link
          href={`/workspace/${workspaceId}/sources`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sources Library</span>
        </Link>
      </div>
      <SourceDetail workspaceId={workspaceId} sourceId={sourceId} />
    </div>
  );
}
