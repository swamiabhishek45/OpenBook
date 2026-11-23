import React from "react";
import Image from "next/image";
import {
  Brain,
  FileCode2,
  FileText,
  Globe,
  ImageIcon,
  LayoutGrid,
  Quote,
  Type,
} from "lucide-react";
import { YoutubeIcon } from "@/components/ui/youtube-icon";
import { cn } from "@/lib/utils";
import { GithubIcon } from "./brand-icons";
import { Fade, IconTile, PANEL, SectionHeading } from "./primitives";

const SOURCE_TYPES: { label: string; icon: React.ReactNode; tint: string }[] = [
  { label: "PDF", icon: <FileText className="size-6" strokeWidth={2} />, tint: "bg-[#e5484d] text-white" },
  { label: "Web", icon: <Globe className="size-6" strokeWidth={2} />, tint: "bg-[#3b6fe0] text-white" },
  { label: "YouTube", icon: <YoutubeIcon size={26} />, tint: "bg-card" },
  {
    label: "Drive",
    icon: <Image src="/integrations/google-drive-logo.png" alt="" width={26} height={26} className="size-6.5 object-contain" />,
    tint: "bg-card",
  },
  {
    label: "Notion",
    icon: (
      <>
        <Image src="/integrations/notion-logo.webp" alt="" width={26} height={26} className="dark:hidden" />
        <Image src="/integrations/notion-logo-white.webp" alt="" width={26} height={26} className="hidden dark:block" />
      </>
    ),
    tint: "bg-card",
  },
  { label: "GitHub", icon: <GithubIcon className="size-6" />, tint: "bg-foreground text-background" },
  { label: "Image", icon: <ImageIcon className="size-6" strokeWidth={2} />, tint: "bg-[#3fae5a] text-white" },
  { label: "Markdown", icon: <FileCode2 className="size-6" strokeWidth={2} />, tint: "bg-[#8b5cf6] text-white" },
  { label: "Text", icon: <Type className="size-6" strokeWidth={2} />, tint: "bg-[#e9a23b] text-white" },
];

const STUDIO_FORMATS = ["Summary", "Quiz", "Flashcards", "Mind map", "Report", "Podcast"];

function BigNumber({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[clamp(64px,7vw,96px)] leading-none font-semibold tracking-[-0.06em]",
        className
      )}
    >
      {children}
    </p>
  );
}

function TileText({
  title,
  body,
  dark,
}: {
  title: string;
  body: string;
  dark?: boolean;
}) {
  return (
    <div className="mt-auto pt-8">
      <h3 className="text-[22px] font-semibold tracking-[-0.02em]">{title}</h3>
      <p className={cn("mt-1.5 text-[15px] leading-[1.55]", dark ? "text-background/65" : "text-muted-foreground")}>
        {body}
      </p>
    </div>
  );
}

export function FeatureGrid() {
  return (
    <section
      aria-labelledby="grid-title"
      className="mx-auto w-full max-w-[1240px] px-5 pt-32 sm:px-6 sm:pt-44"
    >
      <SectionHeading id="grid-title" eyebrow="Everything in one notebook" align="center" size="lg">
        A whole research studio.{" "}
        <IconTile tone="ink" tilt={-4}>
          <LayoutGrid strokeWidth={2.2} />
        </IconTile>{" "}
        <Fade>One notebook.</Fade>
      </SectionHeading>

      <div className="mt-16 grid gap-3 lg:grid-cols-3">
        {/* Sources: wide tile */}
        <article className={cn(PANEL, "flex flex-col p-8 lg:col-span-2")}>
          <ul className="flex flex-wrap gap-x-3 gap-y-4">
            {SOURCE_TYPES.map((source) => (
              <li key={source.label} className="flex w-16 flex-col items-center gap-2">
                <span
                  className={cn(
                    "flex size-16 items-center justify-center rounded-[18px] shadow-[0_2px_6px_rgb(0_0_0/0.08)]",
                    source.tint
                  )}
                >
                  {source.icon}
                </span>
                <span className="text-[12.5px] text-muted-foreground">{source.label}</span>
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-end gap-4 pt-12">
            <BigNumber>9</BigNumber>
            <div className="pb-2">
              <h3 className="text-[18px] font-semibold tracking-[-0.01em]">source types, one library</h3>
              <p className="mt-1 max-w-[340px] text-[15px] leading-[1.5] text-muted-foreground">
                Web pages are scraped with Firecrawl and videos arrive as transcripts, so all of
                it is searchable.
              </p>
            </div>
          </div>
        </article>

        {/* Podcast hosts */}
        <article className={cn(PANEL, "flex min-h-[320px] flex-col p-8")}>
          <div className="flex items-start justify-between">
            <BigNumber>2</BigNumber>
            <span className="flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 font-mono text-[11px]">
              <span className="size-1.5 rounded-full bg-[#e5484d] motion-safe:animate-pulse" aria-hidden="true" />
              ON AIR
            </span>
          </div>
          <div className="mt-6 flex -space-x-2" aria-hidden="true">
            {["A", "J"].map((initial, i) => (
              <span
                key={initial}
                className={cn(
                  "flex size-10 items-center justify-center rounded-full text-[14px] font-semibold ring-[3px] ring-muted",
                  i === 0 ? "bg-foreground text-background" : "bg-card"
                )}
              >
                {initial}
              </span>
            ))}
          </div>
          <TileText
            title="hosts, Alex & Jordan"
            body="They debate your sources. Pause anytime and ask."
          />
        </article>

        {/* Studio formats: the one dark tile */}
        <article className="flex min-h-[320px] flex-col rounded-[24px] bg-foreground p-8 text-background">
          <BigNumber>6</BigNumber>
          <ul className="mt-6 flex flex-wrap gap-1.5">
            {STUDIO_FORMATS.map((format) => (
              <li
                key={format}
                className="rounded-full bg-background/10 px-2.5 py-1 text-[12.5px] text-background/85"
              >
                {format}
              </li>
            ))}
          </ul>
          <TileText dark title="study formats" body="Generated from the same library you chat with." />
        </article>

        {/* Citations */}
        <article className={cn(PANEL, "flex min-h-[320px] flex-col p-8")}>
          <span className="flex size-14 items-center justify-center rounded-[14px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
            <Quote className="size-5" strokeWidth={2} />
          </span>
          <div className="mt-8 space-y-2 font-mono text-[12px]">
            <p className="flex justify-between rounded-[10px] bg-card px-3 py-2">
              <span>[1] paper.pdf</span>
              <span className="text-muted-foreground">p. 12</span>
            </p>
            <p className="flex justify-between rounded-[10px] bg-card px-3 py-2">
              <span>[2] lecture.mp4</span>
              <span className="text-muted-foreground">14:08</span>
            </p>
          </div>
          <TileText title="Cited, every time" body="Each answer lists the passages it used." />
        </article>

        {/* Memory */}
        <article className={cn(PANEL, "flex min-h-[320px] flex-col p-8")}>
          <span className="flex size-14 items-center justify-center rounded-[14px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
            <Brain className="size-5" strokeWidth={2} />
          </span>
          <div className="mt-8 font-mono text-[11.5px] text-muted-foreground">
            <div className="flex justify-between">
              <span>memory.profile</span>
              <span>synced</span>
            </div>
            <div className="mt-2 h-1 rounded-full bg-foreground" />
          </div>
          <TileText
            title="Remembers how you learn"
            body="A new notebook doesn't start from zero. Inspect or clear it anytime."
          />
        </article>
      </div>
    </section>
  );
}
