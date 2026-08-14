"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Plus, Loader2 } from "lucide-react";
import { StudioPanel, useArtifacts } from "@/features/learn";
import { useSources } from "@/features/sources";

interface WorkspaceLearnPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function WorkspaceLearnPage({
  params,
}: WorkspaceLearnPageProps) {
  const { workspaceId } = use(params);
  const { artifacts, createArtifact, deleteArtifact, isCreating } =
    useArtifacts(workspaceId);
  const sourcesQuery = useSources(workspaceId);
  const sources = sourcesQuery.data || [];

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
          Study Studio Hub
        </span>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8">
        <StudioPanel
          artifacts={artifacts}
          onCreateArtifact={(type) => createArtifact({ type })}
          onDeleteArtifact={deleteArtifact}
          isCreating={isCreating}
          selectedSourcesCount={sources.length}
        />
      </div>
    </div>
  );
}
