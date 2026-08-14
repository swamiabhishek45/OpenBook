import React from "react";
import { WorkspaceLayout } from "@/features/workspaces";
import { Metadata } from "next";

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export async function generateMetadata({
  params,
}: WorkspacePageProps): Promise<Metadata> {
  const { workspaceId } = await params;
  return {
    title: `Notebook - OpenBook`,
    description: `AI Notebook Workspace ${workspaceId}`,
  };
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  return <WorkspaceLayout workspaceId={workspaceId} />;
}
