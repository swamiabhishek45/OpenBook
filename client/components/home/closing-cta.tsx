import React from "react";
import Image from "next/image";
import { ArrowRight, FileText, Globe, Library } from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { OpenBookLogo } from "@/features/auth";
import { cn } from "@/lib/utils";
import { Fade, IconTile, PillLink } from "./primitives";

interface ClosingCtaProps {
  isAuthenticated?: boolean;
}

interface SourceNode {
  label: string;
  meta: string;
  icon: React.ReactNode;
  tint: string;
  side: "left" | "right";
  row: 0 | 1;
}

const NODES: SourceNode[] = [
  { label: "paper.pdf", meta: "42 pages", icon: <FileText className="size-4.5" />, tint: "bg-[#e5484d] text-white", side: "left", row: 0 },
  { label: "Lecture 7", meta: "1h 12m transcript", icon: <YoutubeIcon size={18} />, tint: "bg-card ring-1 ring-border", side: "left", row: 1 },
  {
    label: "Research notes",
    meta: "Notion · 18 pages",
    icon: (
      <>
        <Image src="/integrations/notion-logo.webp" alt="" width={18} height={18} className="dark:hidden" />
        <Image src="/integrations/notion-logo-white.webp" alt="" width={18} height={18} className="hidden dark:block" />
      </>
    ),
    tint: "bg-card ring-1 ring-border",
    side: "right",
    row: 0,
  },
  { label: "arxiv.org", meta: "web page", icon: <Globe className="size-4.5" />, tint: "bg-[#3b6fe0] text-white", side: "right", row: 1 },
];

// Curves from each card's inner edge to the logo in the middle of an 800x260 box.
const PATHS = [
  "M190 70 C 300 70, 300 130, 400 130",
  "M190 190 C 300 190, 300 130, 400 130",
  "M610 70 C 500 70, 500 130, 400 130",
  "M610 190 C 500 190, 500 130, 400 130",
];

function FlowDiagram() {
  return (
    <div className="relative mx-auto mt-14 hidden h-[260px] w-full max-w-[800px] md:block" aria-hidden="true">
      <svg viewBox="0 0 800 260" className="absolute inset-0 size-full" fill="none">
        {PATHS.map((d, i) => (
          <g key={d}>
            <path d={d} className="stroke-foreground/15" strokeWidth="1.5" />
            <circle r="3.5" className="fill-foreground motion-reduce:hidden">
              <animateMotion dur="2.8s" begin={`${i * 0.7}s`} repeatCount="indefinite" path={d} />
            </circle>
          </g>
        ))}
      </svg>

      {NODES.map((node) => (
        <div
          key={node.label}
          className={cn(
            "absolute flex w-[190px] items-center gap-3 rounded-[14px] bg-card p-2.5 pr-3 shadow-[0_10px_30px_-12px_rgb(0_0_0/0.2)]",
            node.side === "left" ? "left-0" : "right-0",
            node.row === 0 ? "top-[42px]" : "top-[162px]"
          )}
        >
          <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-[10px]", node.tint)}>
            {node.icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[14px] font-semibold">{node.label}</span>
            <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-[#3fae5a]" />
              {node.meta}
            </span>
          </span>
        </div>
      ))}

      <div className="absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
        <span className="rounded-[34px] p-2 ring-1 ring-foreground/10">
          <span className="flex size-[104px] items-center justify-center rounded-[28px] bg-card shadow-[0_20px_40px_-16px_rgb(0_0_0/0.35)]">
            <OpenBookLogo size={64} showText={false} />
          </span>
        </span>
        <span className="-mt-3 flex items-center gap-2 rounded-full bg-foreground px-3 py-1.5 font-mono text-[11.5px] text-background">
          <span className="size-1.5 rounded-full bg-[#3fae5a]" />4 sources · cited
        </span>
      </div>
    </div>
  );
}

export function ClosingCta({ isAuthenticated = false }: ClosingCtaProps) {
  return (
    <section className="px-3 pt-32 sm:px-6 sm:pt-44">
      <div className="mx-auto w-full max-w-[1290px] rounded-[32px] bg-muted/60 px-5 py-20 sm:py-28 dark:bg-muted/70">
        <h2 className="mx-auto max-w-[900px] text-center text-[clamp(36px,4.8vw,64px)] leading-[1.14] font-semibold tracking-[-0.035em] text-balance">
          Your whole library.{" "}
          <IconTile tone="ink" tilt={4}>
            <Library strokeWidth={2.2} />
          </IconTile>{" "}
          <Fade>Now it talks back.</Fade>
        </h2>

        <FlowDiagram />

        <div className="mt-14 flex flex-col items-center">
          <PillLink href={isAuthenticated ? "/dashboard" : "/signup"} size="lg">
            {isAuthenticated ? "Open dashboard" : "Start for free"}
            <ArrowRight className="size-4" />
          </PillLink>
          <p className="mt-5 text-[14px] text-muted-foreground/80">
            50 free credits. Open source, self-host anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
