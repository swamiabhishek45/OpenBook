import React from "react";
import { cn } from "@/lib/utils";

export interface ThemeBlobProps {
  size?: number | string;
  className?: string;
}

export function ThemeBlob({ size = 20, className }: ThemeBlobProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <span
      className={cn("inline-flex items-center justify-center relative shrink-0 overflow-hidden", className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Light theme: uses bloub-dark.gif on light background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bloub.gif"
        alt="OpenBook AI"
        className="w-full h-full object-contain block dark:hidden select-none pointer-events-none"
      />
      {/* Dark theme: uses bloub-light.gif on dark background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/bloub.gif"
        alt="OpenBook AI"
        className="w-full h-full object-contain hidden dark:block select-none pointer-events-none"
      />
    </span>
  );
}
