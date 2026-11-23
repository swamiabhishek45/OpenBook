"use client";

import React, { useState } from "react";
import { LearningArtifact, ArtifactType } from "../types";
import { ArtifactModal } from "./artifact-modal";
import {
  Trash2,
  ChevronRight,
  Clock,
  AlertCircle,
  Coins,
  RefreshCw,
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
import { MovingBorderCard } from "@/components/ui/moving-border";
import { useUpgradeModal, useUsage } from "@/features/billing";
import {
  META_CHIP,
  PanelLabel,
  RAISED,
  RAISED_HOVER,
  iconButtonClassName,
} from "@/components/ui/pill";
import { cn, formatDate } from "@/lib/utils";

interface StudioPanelProps {
  artifacts: LearningArtifact[];
  onCreateArtifact: (type: ArtifactType) => Promise<unknown>;
  onDeleteArtifact: (id: string) => Promise<unknown>;
  onRetryArtifact?: (id: string) => Promise<unknown>;
  isCreating: boolean;
  isRetrying?: boolean;
  retryingArtifactId?: string;
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
        className={`text-foreground transition-transform ${
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
        className="text-foreground"
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
        className="text-foreground"
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
        className="text-foreground"
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
        className="text-foreground"
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
        className="text-foreground"
      />
    ),
  },
];

export function StudioPanel({
  artifacts,
  onCreateArtifact,
  onDeleteArtifact,
  onRetryArtifact,
  isCreating,
  isRetrying = false,
  retryingArtifactId,
  selectedSourcesCount,
}: StudioPanelProps) {
  const { credits } = useUsage();
  const [selectedArtifact, setSelectedArtifact] = useState<LearningArtifact | null>(null);
  const [generatingType, setGeneratingType] = useState<ArtifactType | null>(null);
  const [hoveredTool, setHoveredTool] = useState<ArtifactType | null>(null);

  const handleCreate = async (type: ArtifactType) => {
    const requiredCredits = type === "PODCAST" ? 50 : 10;
    if (credits < requiredCredits) {
      useUpgradeModal.getState().openUpgradeModal({
        reason: `${type === "PODCAST" ? "Audio Debate Podcast" : "Artifact generation"} requires ${requiredCredits} credits. Please top up your balance.`,
        limitType: "credits",
        requiredCredits,
        currentCredits: credits,
      });
      return;
    }

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

  const renderFailedActions = (artifactId: string) => {
    const isThisRetrying = isRetrying && retryingArtifactId === artifactId;

    return (
      <span className="flex items-center gap-1">
        <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
          <AlertCircle className="size-2.5" />
          Failed
        </span>
        {onRetryArtifact && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              void onRetryArtifact(artifactId);
            }}
            disabled={isThisRetrying}
            title="Retry generation"
            className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground transition-colors hover:bg-border/70 disabled:pointer-events-none disabled:opacity-50"
          >
            <RefreshCw
              className={cn("size-2.5", isThisRetrying && "animate-spin")}
            />
            Retry
          </button>
        )}
      </span>
    );
  };

  const getTypeIcon = (type: ArtifactType) => {
    switch (type) {
      case "PODCAST":
        return <AudioLinesIcon size={14} className="text-foreground" />;
      case "SUMMARY":
        return <AnimatedBookOpen size={14} className="text-foreground" />;
      case "FLASHCARDS":
        return <AnimatedLayers size={14} className="text-foreground" />;
      case "QUIZ":
        return <AnimatedHelpCircle size={14} className="text-foreground" />;
      case "MINDMAP":
        return <AnimatedNetwork size={14} className="text-foreground" />;
      case "TAKEAWAYS":
        return <AnimatedListChecks size={14} className="text-foreground" />;
      case "REPORT":
        return <AnimatedFileText size={14} className="text-foreground" />;
      default:
        return <AnimatedBookOpen size={14} className="text-foreground" />;
    }
  };

  return (
    <div className="flex h-full flex-col px-2 pb-3 text-foreground select-none">
      {/* One soft surface for the whole panel, like a landing-page bento tile. */}
      <div className="flex h-full min-h-0 flex-col rounded-[22px] bg-muted/60 dark:bg-muted/70">
        <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3">
          <PanelLabel count={artifacts.length}>Studio</PanelLabel>

          <span className="text-[12px] text-muted-foreground">Learning tools</span>
        </div>

        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto px-3.5 pb-4">
          {/* Generators */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2 px-0.5">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                Generate from sources
              </h3>
              {selectedSourcesCount === 0 ? (
                <span className="animate-fadeIn inline-flex items-center rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  Select sources
                </span>
              ) : (
                <span className={META_CHIP}>{selectedSourcesCount} selected</span>
              )}
            </div>

          <div className="grid grid-cols-2 gap-2">
            {STUDIO_TOOLS.map((tool) => {
              const isThisGenerating = generatingType === tool.type;
              const requiredCost = tool.type === "PODCAST" ? 50 : 10;
              const hasInsufficientCredits = credits < requiredCost;

              const costChip = (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold",
                    tool.type === "PODCAST"
                      ? "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Coins className="size-2.5 text-amber-500" />
                  {requiredCost} cr
                </span>
              );

              const cardContent = (
                <div className="flex h-full w-full flex-col justify-between p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex size-8 items-center justify-center rounded-[11px] bg-muted">
                      {isThisGenerating ? (
                        <ThemeLoader size={16} />
                      ) : (
                        tool.renderIcon(hoveredTool === tool.type)
                      )}
                    </span>
                    {costChip}
                  </div>
                  <div>
                    <span className="block truncate text-[13px] font-medium text-foreground">
                      {tool.title}
                    </span>
                    <span className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                      {isThisGenerating ? "Generating..." : tool.desc}
                    </span>
                  </div>
                </div>
              );

              if (isThisGenerating) {
                return (
                  <MovingBorderCard
                    key={tool.type}
                    borderRadius="1.125rem"
                    duration={2000}
                    className="bg-card text-left"
                    containerClassName="w-full h-full min-h-[96px]"
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
                  disabled={hasInsufficientCredits ? false : (isCreating || selectedSourcesCount === 0)}
                  title={
                    selectedSourcesCount === 0 && !hasInsufficientCredits
                      ? "Please select at least one source in the sources panel to generate artifacts"
                      : hasInsufficientCredits
                      ? `${tool.title} requires ${requiredCost} credits (Current balance: ${credits})`
                      : `Generate ${tool.title} (${requiredCost} credits)`
                  }
                  className={cn(
                    "group flex min-h-[96px] flex-col justify-between rounded-[18px] text-left",
                    "transition-[background-color,transform] duration-200 ease-out",
                    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                    !hasInsufficientCredits && selectedSourcesCount === 0
                      ? "cursor-not-allowed bg-card/40 opacity-50 select-none dark:bg-white/3"
                      : cn(RAISED, RAISED_HOVER, "cursor-pointer active:scale-[0.98]")
                  )}
                >
                  {cardContent}
                </button>
              );
              })}
            </div>
          </div>

          {/* Everything generated so far */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 px-0.5">
              <h3 className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
                Created artifacts
              </h3>
              <span className={META_CHIP}>{artifacts.length}</span>
            </div>

            {artifacts.length === 0 ? (
              <div className="rounded-[18px] bg-card/50 p-6 text-center dark:bg-white/4">
                <p className="text-[13.5px] font-medium text-foreground">
                  Nothing generated yet
                </p>
                <p className="mx-auto mt-1 max-w-[220px] text-[12px] leading-[1.5] text-muted-foreground">
                  Pick a tool above to turn your sources into notes, a quiz, or a
                  podcast.
                </p>
              </div>
            ) : (
            <div className="space-y-1.5">
              {artifacts.map((artifact) => {
                const isReady = artifact.status === "READY";
                const isPending =
                  artifact.status === "PENDING" ||
                  artifact.status === "PROCESSING";

                // One body for both the plain row and the animated pending row.
                const artifactCardBody = (
                  <div className="flex w-full items-center justify-between p-3">
                    <div className="flex min-w-0 items-center gap-2.5 pr-2">
                      <span
                        aria-hidden="true"
                        className="flex size-8 shrink-0 items-center justify-center rounded-[11px] bg-muted"
                      >
                        {getTypeIcon(artifact.type)}
                      </span>

                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-foreground">
                          {artifact.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                          <span className="font-mono">{artifact.type}</span>
                          <span aria-hidden="true">•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-2.5" />
                            {formatDate(artifact.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-medium text-amber-700 dark:text-amber-300">
                          <ThemeLoader size={11} />
                          Generating
                        </span>
                      )}

                      {artifact.status === "FAILED" &&
                        renderFailedActions(artifact.id)}

                      {isReady && (
                        <ChevronRight className="size-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-foreground" />
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
                        aria-label={`Delete ${artifact.title}`}
                        className={cn(
                          iconButtonClassName({ tone: "danger", size: "sm" }),
                          "opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
                        )}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );

                if (isPending) {
                  return (
                    <MovingBorderCard
                      key={artifact.id}
                      borderRadius="1.125rem"
                      duration={2200}
                      className="bg-card"
                      containerClassName="group w-full"
                    >
                      {artifactCardBody}
                    </MovingBorderCard>
                  );
                }

                return (
                  <div
                    key={artifact.id}
                    role={isReady ? "button" : undefined}
                    tabIndex={isReady ? 0 : undefined}
                    className={cn(
                      "group flex items-center justify-between rounded-[18px] select-none",
                      "transition-[background-color,transform] duration-150 ease-out",
                      "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
                      isReady
                        ? cn(RAISED, RAISED_HOVER, "cursor-pointer")
                        : "bg-card/40 dark:bg-white/3",
                    )}
                    onClick={() => {
                      if (isReady) setSelectedArtifact(artifact);
                    }}
                    onKeyDown={(e) => {
                      if (isReady && (e.key === "Enter" || e.key === " ")) {
                        e.preventDefault();
                        setSelectedArtifact(artifact);
                      }
                    }}
                  >
                    {artifactCardBody}
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      </div>

      <ArtifactModal
        artifact={selectedArtifact}
        onClose={() => setSelectedArtifact(null)}
      />
    </div>
  );
}
