"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedIconProps } from "./book-open";

export function AnimatedNetwork({
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
        {/* Top Central Node Box */}
        <motion.rect
          x="9"
          y="2"
          width="6"
          height="6"
          rx="1"
          animate={{
            scale: isHovered ? 1.15 : 1,
            y: isHovered ? -1 : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Bottom Left Node Box */}
        <motion.rect
          x="2"
          y="16"
          width="6"
          height="6"
          rx="1"
          animate={{
            scale: isHovered ? 1.15 : 1,
            x: isHovered ? -1 : 0,
          }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />

        {/* Bottom Right Node Box */}
        <motion.rect
          x="16"
          y="16"
          width="6"
          height="6"
          rx="1"
          animate={{
            scale: isHovered ? 1.15 : 1,
            x: isHovered ? 1 : 0,
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />

        {/* Connecting Lines */}
        <motion.path
          d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"
          animate={{
            pathLength: isHovered ? [0.8, 1] : 1,
          }}
          transition={{ duration: 0.35 }}
        />
        <motion.path
          d="M12 12V8"
          animate={{
            pathLength: isHovered ? [0.5, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />
      </svg>
    </div>
  );
}
