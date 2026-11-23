"use client";

import React, { useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const CLIPS = [
  { id: "pdf", label: "PDF", alt: "Uploading a PDF in the Add Source dialog" },
  { id: "drive", label: "Drive", alt: "Picking a file from Google Drive in the Add Source dialog" },
  { id: "github", label: "GitHub", alt: "Adding a GitHub repository in the Add Source dialog" },
  { id: "youtube", label: "YouTube", alt: "Pasting a YouTube link in the Add Source dialog" },
] as const;

type ClipId = (typeof CLIPS)[number]["id"];

const src = (id: ClipId, ext: "mp4" | "jpg") => `/landing/sources/${id}.${ext}`;

interface SourcesDemoProps {
  /** Eyebrow, headline and body, rendered by the server. */
  header: React.ReactNode;
  note: { code: string; text: string };
  imageFirst?: boolean;
}

export function SourcesDemo({ header, note, imageFirst }: SourcesDemoProps) {
  const [active, setActive] = useState<ClipId>("pdf");
  // Clips that failed to load fall back to the static screenshot.
  const [missing, setMissing] = useState<Set<ClipId>>(() => new Set());
  const reduceMotion = useReducedMotion();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const clip = CLIPS.find((c) => c.id === active)!;

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = CLIPS.findIndex((c) => c.id === active);
    const next = CLIPS[(i + (e.key === "ArrowRight" ? 1 : CLIPS.length - 1)) % CLIPS.length];
    setActive(next.id);
    tabRefs.current[next.id]?.focus();
  };

  return (
    <>
      <div className={cn(imageFirst && "lg:order-2")}>
        {header}

        <div
          role="tablist"
          aria-label="Source type"
          onKeyDown={onKeyDown}
          className="mt-8 inline-flex max-w-full flex-wrap gap-1 rounded-[22px] bg-muted/60 p-1 dark:bg-muted/70"
        >
          {CLIPS.map((c) => {
            const selected = c.id === active;
            return (
              <button
                key={c.id}
                ref={(el) => {
                  tabRefs.current[c.id] = el;
                }}
                type="button"
                role="tab"
                id={`source-tab-${c.id}`}
                aria-selected={selected}
                aria-controls="source-clip"
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(c.id)}
                className={cn(
                  "flex h-10 items-center rounded-full px-4 text-[14px] font-medium outline-none",
                  "transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.96]",
                  "focus-visible:ring-2 focus-visible:ring-ring/40",
                  selected
                    ? "bg-foreground text-background"
                    : "text-foreground/80 hover:bg-foreground/6 hover:text-foreground"
                )}
              >
                {c.label}
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-[14px] text-muted-foreground">
          <code className="font-mono text-[13px] text-foreground">{note.code}</code> {note.text}
        </p>
      </div>

      <div
        className={cn(
          "rounded-[28px] bg-muted/60 p-[clamp(12px,2.4vw,32px)] dark:bg-muted/70",
          imageFirst && "lg:order-1"
        )}
      >
        <div
          id="source-clip"
          role="tabpanel"
          aria-labelledby={`source-tab-${active}`}
          className="relative overflow-hidden rounded-[14px] bg-[#f6efe7] shadow-[0_30px_60px_-24px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:ring-white/10"
          // Sized to the tallest clip (GitHub); shorter ones center on matching sand.
          style={{ aspectRatio: "1200 / 1192" }}
        >
          {missing.has(clip.id) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/landing/source.png"
              alt="The Add Source dialog, open on the PDF tab, with its drop zone and the other source types across the top"
              className="absolute inset-0 size-full object-cover object-top"
            />
          ) : reduceMotion ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src(clip.id, "jpg")}
              alt={clip.alt}
              onError={() => setMissing((prev) => new Set(prev).add(clip.id))}
              className="absolute inset-0 size-full object-contain object-center"
            />
          ) : (
            // Keyed on the clip so switching tabs restarts it from the first frame.
            <video
              key={clip.id}
              src={src(clip.id, "mp4")}
              poster={src(clip.id, "jpg")}
              aria-label={clip.alt}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onError={() => setMissing((prev) => new Set(prev).add(clip.id))}
              // A 404 during server render errors before React attaches onError,
              // so also read the element's error state once it mounts.
              ref={(el) => {
                if (el?.error) setMissing((prev) => new Set(prev).add(clip.id));
              }}
              className="absolute inset-0 size-full object-contain object-center"
            />
          )}
        </div>
      </div>

      {/* Warm the other clips so switching tabs doesn't flash. */}
      <div hidden>
        {!reduceMotion &&
          CLIPS.filter((c) => c.id !== active).map((c) => (
            <link key={c.id} rel="prefetch" href={src(c.id, "mp4")} as="video" />
          ))}
      </div>
    </>
  );
}
