"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

const FRAME_GRADIENTS = {
  blue: "from-[#c3d4f0] via-[#dde6f8] to-[#a9c1e8] dark:from-[#1b2540] dark:via-[#232d4a] dark:to-[#141a2c]",
  sand: "from-[#e6d3b8] via-[#f1e6d5] to-[#d5bb99] dark:from-[#2b241a] dark:via-[#332b20] dark:to-[#1e1913]",
  violet:
    "from-[#d3cef1] via-[#e6e3f9] to-[#bfb8e8] dark:from-[#221f3c] dark:via-[#2a2647] dark:to-[#181528]",
  green:
    "from-[#c4ddc9] via-[#dcebde] to-[#a9cdb1] dark:from-[#182a1f] dark:via-[#1f3327] dark:to-[#121d16]",
} as const;

export type FrameTone = keyof typeof FRAME_GRADIENTS;

interface ShowcaseFrameProps {
  src: string;
  alt: string;
  tone?: FrameTone;
  /** CSS aspect-ratio for the inner screenshot, e.g. "16 / 10". */
  aspect?: string;
  priority?: boolean;
  className?: string;
}

export function ShowcaseFrame({
  src,
  alt,
  tone = "blue",
  aspect = "16 / 10",
  priority = false,
  className,
}: ShowcaseFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "rounded-[26px] bg-linear-to-br p-4 sm:p-7",
        FRAME_GRADIENTS[tone],
        className
      )}
    >
      <div
        className="relative overflow-hidden rounded-xl bg-card ring-1 ring-black/5 shadow-[0_24px_50px_-28px_rgb(24_24_27/0.5)] dark:ring-white/10"
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
            sizes="(max-width: 768px) 100vw, 900px"
            className="object-cover object-top"
            onError={() => setFailed(true)}
          />
        )}
      </div>
    </div>
  );
}
