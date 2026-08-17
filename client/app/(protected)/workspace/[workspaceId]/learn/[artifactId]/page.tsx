"use client";

import React, { use } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { useArtifacts } from "@/features/learn";
import { FlashcardsViewer } from "@/features/learn/components/flashcards-viewer";
import { QuizViewer } from "@/features/learn/components/quiz-viewer";
import { MindmapViewer } from "@/features/learn/components/mindmap-viewer";
import { TakeawaysViewer } from "@/features/learn/components/takeaways-viewer";
import { SummaryViewer } from "@/features/learn/components/summary-viewer";

interface FullscreenArtifactPageProps {
  params: Promise<{
    workspaceId: string;
    artifactId: string;
  }>;
}

export default function FullscreenArtifactPage({
  params,
}: FullscreenArtifactPageProps) {
  const { workspaceId, artifactId } = use(params);
  const { artifacts, isLoading } = useArtifacts(workspaceId);

  const artifact = artifacts.find((a) => a.id === artifactId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <ThemeLoader size={36} />
      </div>
    );
  }

  if (!artifact) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 text-center gap-3">
        <p className="text-sm font-medium text-destructive">Artifact not found</p>
        <Link
          href={`/workspace/${workspaceId}/learn`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-border bg-card hover:bg-muted text-foreground"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Studio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border px-6 py-3.5 flex items-center justify-between bg-card">
        <Link
          href={`/workspace/${workspaceId}/learn`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Studio Hub</span>
        </Link>
        <span className="text-xs font-semibold text-foreground truncate max-w-sm">
          {artifact.title}
        </span>
      </div>

      <div className="flex-1 max-w-5xl mx-auto w-full p-6 md:p-8">
        {artifact.type === "FLASHCARDS" && artifact.content?.cards && (
          <FlashcardsViewer cards={artifact.content.cards} />
        )}
        {artifact.type === "QUIZ" && artifact.content?.questions && (
          <QuizViewer questions={artifact.content.questions} />
        )}
        {artifact.type === "TAKEAWAYS" && (
          <TakeawaysViewer content={artifact.content?.items || []} />
        )}
        {(artifact.type === "SUMMARY" || artifact.type === "REPORT") && (
          <SummaryViewer
            content={artifact.content?.markdown || ""}
            title={artifact.title}
          />
        )}
        {artifact.type === "MINDMAP" && (
          <MindmapViewer content={artifact.content?.nodes || artifact.content || {}} />
        )}
      </div>
    </div>
  );
}
