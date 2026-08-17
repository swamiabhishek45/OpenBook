import React from "react";
import { cn } from "@/lib/utils";

export interface ThemeLoaderProps {
  size?: number | string;
  className?: string;
  label?: string;
}

export function ThemeLoader({ size = 34, className, label }: ThemeLoaderProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  return (
    <span
      role="status"
      aria-label={label || "Loading"}
      className={cn("inline-flex items-center justify-center relative shrink-0", className)}
      style={{ width: pixelSize, height: pixelSize }}
    >
      {/* Light theme: uses dark-lodaer.gif on light background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/dark-lodaer.gif"
        alt="Loading..."
        className="w-full h-full object-contain block dark:hidden select-none pointer-events-none"
      />
      {/* Dark theme: uses light-lodader.gif on dark background */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/light-lodader.gif"
        alt="Loading..."
        className="w-full h-full object-contain hidden dark:block select-none pointer-events-none"
      />
    </span>
  );
}

export { ThemeLoader as Spinner };
