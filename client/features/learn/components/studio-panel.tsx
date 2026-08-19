"use client";

import React, { useState } from "react";
import { LearningArtifact, ArtifactType } from "../types";
import { ArtifactModal } from "./artifact-modal";
import {

  Sparkles,
  Trash2,
  ChevronRight,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AudioLinesIcon } from "@/components/ui/audio-lines";
import {
  AnimatedBookOpen,
  AnimatedListChecks,
  AnimatedLayers,
  AnimatedHelpCircle,
  AnimatedNetwork,
  AnimatedFileText,
} from "@/components/ui/animated-icons";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn, formatDate } from "@/lib/utils";

interface StudioPanelProps {
  artifacts: LearningArtifact[];
  onCreateArtifact: (type: ArtifactType) => Promise<unknown>;
  onDeleteArtifact: (id: string) => Promise<unknown>;
  isCreating: boolean;
  selectedSourcesCount: number;
}

const STUDIO_TOOLS: {
  type: ArtifactType;
  title: string;
  desc: string;
  renderIcon: (isHovered: boolean) => React.ReactNode;
}[] = [
  {
    type: "PODCAST",
    title: "Audio Debate Podcast",
    desc: "Two AI hosts debate & analyze your sources into an audio show",
    renderIcon: (isHovered) => (
      <AudioLinesIcon
        size={16}
        className={`text-zinc-800 dark:text-zinc-200 transition-transform ${
          isHovered ? "scale-110" : ""
        }`}
      />
    ),
  },
  {
    type: "SUMMARY",
    title: "Summary",
    desc: "Comprehensive overview of your sources",
    renderIcon: (isHovered) => (
      <AnimatedBookOpen
        size={16}
        isHovered={isHovered}
        className="text-zinc-800 dark:text-zinc-200"
      />
    ),
  },
  {
    type: "TAKEAWAYS",
    title: "Key Takeaways",
    desc: "Bullet points of the main findings",
    renderIcon: (isHovered) => (
      <AnimatedListChecks
        size={16}
        isHovered={isHovered}
        className="text-zinc-800 dark:text-zinc-200"
      />
    ),
  },
  {
    type: "FLASHCARDS",
    title: "Flashcards",
    desc: "Interactive flip study cards deck",
    renderIcon: (isHovered) => (
      <AnimatedLayers
        size={16}
        isHovered={isHovered}
        className="text-zinc-800 dark:text-zinc-200"
      />
    ),
  },
  {
    type: "QUIZ",
    title: "Practice Quiz",
    desc: "Test your understanding with instant score",
    renderIcon: (isHovered) => (
      <AnimatedHelpCircle
        size={16}
        isHovered={isHovered}
        className="text-zinc-800 dark:text-zinc-200"
      />
    ),
  },
  {
    type: "MINDMAP",
    title: "Mind Map",
    desc: "Hierarchical concept branches & nodes",
    renderIcon: (isHovered) => (
      <AnimatedNetwork
        size={16}
        isHovered={isHovered}
        className="text-zinc-800 dark:text-zinc-200"
      />
    ),
  },
];

import { MovingBorderCard } from "@/components/ui/moving-border";

export function StudioPanel({
  artifacts,
  onCreateArtifact,
  onDeleteArtifact,
  isCreating,
  selectedSourcesCount,
}: StudioPanelProps) {
  const [selectedArtifact, setSelectedArtifact] = useState<LearningArtifact | null>(null);
  const [generatingType, setGeneratingType] = useState<ArtifactType | null>(null);
  const [hoveredTool, setHoveredTool] = useState<ArtifactType | null>(null);

  const handleCreate = async (type: ArtifactType) => {
    if (isCreating || selectedSourcesCount === 0) return;
    setGeneratingType(type);
    try {
      await onCreateArtifact(type);
    } catch (err) {
      console.error("Failed to create artifact:", err);
    } finally {
      setGeneratingType(null);
    }
  };

  const getTypeIcon = (type: ArtifactType) => {
    switch (type) {
      case "PODCAST":
        return <AudioLinesIcon size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "SUMMARY":
        return <AnimatedBookOpen size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "FLASHCARDS":
        return <AnimatedLayers size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "QUIZ":
        return <AnimatedHelpCircle size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "MINDMAP":
        return <AnimatedNetwork size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "TAKEAWAYS":
        return <AnimatedListChecks size={14} className="text-zinc-800 dark:text-zinc-200" />;
      case "REPORT":
        return <AnimatedFileText size={14} className="text-zinc-800 dark:text-zinc-200" />;
      default:
        return <AnimatedBookOpen size={14} className="text-zinc-800 dark:text-zinc-200" />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-card border-l border-border text-foreground select-none">
      {/* Studio Header */}
      <div className="p-3.5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Studio
          </span>
          <span className="px-1.5 py-0.2 bg-muted text-[11px] rounded text-muted-foreground font-mono">
            {artifacts.length}
          </span>
        </div>

        <span className="text-[11px] text-muted-foreground font-mono">
          Learning Tools
        </span>
      </div>

      {/* Main Studio Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Quick Tools Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Generate from Sources
            </h3>
            {selectedSourcesCount === 0 ? (
              <span className="text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md font-medium border border-amber-500/20 animate-fadeIn">
                Select sources to enable
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedSourcesCount} selected
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {STUDIO_TOOLS.map((tool) => {
              const isThisGenerating = generatingType === tool.type;

              const cardContent = (
                <div className="p-3 flex flex-col justify-between h-full w-full">
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center mb-2 group-hover:bg-muted/80 transition-colors">
                    {isThisGenerating ? (
                      <ThemeLoader size={16} />
                    ) : (
                      tool.renderIcon(hoveredTool === tool.type)
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground block truncate">
                      {tool.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {isThisGenerating ? "Generating..." : tool.desc}
                    </span>
                  </div>
                </div>
              );

              if (isThisGenerating) {
                return (
                  <MovingBorderCard
                    key={tool.type}
                    borderRadius="0.75rem"
                    duration={2000}
                    className="bg-card text-left"
                    containerClassName="w-full h-full min-h-[92px]"
                  >
                    {cardContent}
                  </MovingBorderCard>
                );
              }

              return (
                <button
                  key={tool.type}
                  type="button"
                  onClick={() => handleCreate(tool.type)}
                  onMouseEnter={() => setHoveredTool(tool.type)}
                  onMouseLeave={() => setHoveredTool(null)}
                  disabled={isCreating || selectedSourcesCount === 0}
                  title={
                    selectedSourcesCount === 0
                      ? "Please select at least one source in the sources panel to generate artifacts"
                      : `Generate ${tool.title}`
                  }
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all flex flex-col justify-between group min-h-[92px]",
                    selectedSourcesCount === 0
                      ? "border-border/60 bg-muted/20 opacity-40 cursor-not-allowed select-none"
                      : "border-border bg-card hover:bg-muted/40 hover:border-zinc-400 dark:hover:border-zinc-600 active:scale-[0.99] cursor-pointer"
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center mb-2 group-hover:bg-muted/80 transition-colors">
                    {tool.renderIcon(hoveredTool === tool.type)}
                  </div>
                  <div>
                    <span className="text-xs font-medium text-foreground block truncate">
                      {tool.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">
                      {tool.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Artifacts History List */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Created Artifacts ({artifacts.length})
          </h3>

          {artifacts.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-border rounded-2xl text-muted-foreground space-y-1 bg-card">
              <p className="text-xs font-medium text-foreground">No artifacts generated yet</p>
              <p className="text-[11px] text-muted-foreground max-w-50 mx-auto">
                Click any tool above to synthesize notes, quizzes, or flashcards.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {artifacts.map((artifact) => {
                const isReady = artifact.status === "READY";
                const isPending =
                  artifact.status === "PENDING" ||
                  artifact.status === "PROCESSING";

                const artifactCardBody = (
                  <div className="p-3 flex items-center justify-between w-full">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                        {getTypeIcon(artifact.type)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {artifact.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-mono">{artifact.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(artifact.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPending && (
                        <span className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <ThemeLoader size={12} />
                          Generating...
                        </span>
                      )}

                      {artifact.status === "FAILED" && (
                        <span className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/30">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Failed
                        </span>
                      )}

                      {isReady && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${artifact.title}"?`)) {
                            onDeleteArtifact(artifact.id);
                          }
                        }}
                        title="Delete artifact"
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );

                if (isPending) {
                  return (
                    <MovingBorderCard
                      key={artifact.id}
                      borderRadius="0.75rem"
                      duration={2200}
                      className="bg-card"
                      containerClassName="w-full"
                    >
                      {artifactCardBody}
                    </MovingBorderCard>
                  );
                }

                return (
                  <div
                    key={artifact.id}
                    className={cn(
                      "group p-3 rounded-xl border transition-all flex items-center justify-between select-none",
                      isReady
                        ? "border-border hover:border-zinc-400 dark:hover:border-zinc-600 bg-card hover:bg-muted/40 cursor-pointer"
                        : "border-border bg-muted/20"
                    )}
                    onClick={() => {
                      if (isReady) setSelectedArtifact(artifact);
                    }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0">
                        {getTypeIcon(artifact.type)}
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">
                          {artifact.title}
                        </p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                          <span className="font-mono">{artifact.type}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {formatDate(artifact.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {artifact.status === "FAILED" && (
                        <span className="flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded border border-destructive/30">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Failed
                        </span>
                      )}

                      {isReady && (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground opacity-60" />
                          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete "${artifact.title}"?`)) {
                            onDeleteArtifact(artifact.id);
                          }
                        }}
                        title="Delete artifact"
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity rounded cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* Artifact Full Modal Viewer */}
      <ArtifactModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  );
}
