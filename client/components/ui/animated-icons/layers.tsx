"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedIconProps } from "./book-open";

export function AnimatedLayers({
  size = 18,
  className,
  isHovered: externalHovered,
  ...props
}: AnimatedIconProps) {
  const [internalHover, setInternalHover] = useState(false);
  const isHovered = externalHovered ?? internalHover;

  return (
    <div
      className="inline-flex items-center justify-center cursor-pointer select-none"
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("overflow-visible", className)}
        {...props}
      >
        {/* Top Polygon */}
        <motion.path
          d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z"
          animate={{
            y: isHovered ? -3 : 0,
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Middle Polygon */}
        <motion.path
          d="m22 12.5-8.58 3.91a2 2 0 0 1-1.66 0L2 12.5"
          animate={{
            y: isHovered ? 0 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Bottom Polygon */}
        <motion.path
          d="m22 17.5-8.58 3.91a2 2 0 0 1-1.66 0L2 17.5"
          animate={{
            y: isHovered ? 2.5 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
