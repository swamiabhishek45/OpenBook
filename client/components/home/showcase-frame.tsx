"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShowcaseFrameProps {
  src: string;
  alt: string;
  /** CSS aspect-ratio for the inner screenshot, e.g. "16 / 10". */
  aspect?: string;
  priority?: boolean;
  className?: string;
}

/** A screenshot set inside a soft, borderless panel. */
export function ShowcaseFrame({
  src,
  alt,
  aspect = "16 / 10",
  priority = false,
  className,
}: ShowcaseFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "rounded-[28px] bg-muted/60 p-[clamp(12px,2.4vw,32px)] dark:bg-muted/70",
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-[14px] bg-card shadow-[0_30px_60px_-24px_rgb(0_0_0/0.35)] ring-1 ring-black/5 dark:ring-white/10"
        style={{ aspectRatio: aspect }}
      >
        {failed ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <ImageOff className="size-5 text-muted-foreground/50" />
            <p className="font-mono text-[11px] text-muted-foreground/70">{src}</p>
            <p className="text-[11px] text-muted-foreground/50">
              Drop the screenshot at this path to replace the placeholder.
            </p>
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            sizes="(max-width: 1024px) 100vw, 720px"
            className="object-cover object-top"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
