"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, Brain, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ReasoningTextVariant = "cascade" | "pulse" | "shimmer" | "fade";

export interface ReasoningTextProps {
  phrases?: string[];
  variant?: ReasoningTextVariant;
  intervalMs?: number;
  className?: string;
  showIcon?: boolean;
  icon?: React.ReactNode;
}

const DEFAULT_PHRASES = [
  "Thinking",
  "Reading the request",
  "Working through the details",
  "Preparing the answer",
];


export function ReasoningText({
  phrases = DEFAULT_PHRASES,
  variant = "cascade",
  intervalMs = 2200,
  className,
  showIcon = true,
  icon,
}: ReasoningTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!phrases || phrases.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [phrases, intervalMs]);

  const currentPhrase = phrases[index] || phrases[0] || "Thinking";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 text-xs text-muted-foreground select-none",
        className
      )}
    >
      {/* Animated Indicator Icon */}
      {showIcon && (
        <div className="relative flex items-center justify-center shrink-0">
          {icon ? (
            icon
          ) : (
            <div className="relative flex items-center justify-center">
              <span className="absolute w-2.5 h-2.5 rounded-full bg-primary/20 animate-ping" />
              <span className="relative w-1.5 h-1.5 rounded-full bg-primary" />
            </div>
          )}
        </div>
      )}

      {/* Text Phrase with Animation */}
      <div className="relative overflow-hidden min-h-[1.25rem] flex items-center">
        <AnimatePresence mode="wait">
          {variant === "cascade" && (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 6, filter: "blur(2px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="font-medium tracking-tight truncate text-foreground/85 inline-flex items-center gap-1"
            >
              <span>{currentPhrase}</span>
              <span className="inline-flex gap-0.5 ml-0.5">
                <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1 h-1 rounded-full bg-muted-foreground/60 animate-bounce" />
              </span>
            </motion.span>
          )}

          {variant === "shimmer" && (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="font-medium bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent"
            >
              {currentPhrase}...
            </motion.span>
          )}

          {variant === "pulse" && (
            <motion.span
              key={index}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="font-medium text-foreground/80"
            >
              {currentPhrase}...
            </motion.span>
          )}

          {variant === "fade" && (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="font-medium text-foreground/85"
            >
              {currentPhrase}...
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
