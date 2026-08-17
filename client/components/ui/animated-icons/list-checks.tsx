"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedIconProps } from "./book-open";

export function AnimatedListChecks({
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
        {/* Lines */}
        <motion.line
          x1="10"
          y1="6"
          x2="21"
          y2="6"
          animate={{ x: isHovered ? [0, 2, 0] : 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />
        <motion.line
          x1="10"
          y1="12"
          x2="21"
          y2="12"
          animate={{ x: isHovered ? [0, 2, 0] : 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />
        <motion.line
          x1="10"
          y1="18"
          x2="21"
          y2="18"
          animate={{ x: isHovered ? [0, 2, 0] : 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        />

        {/* Top Check */}
        <motion.path
          d="m4 6 2 2 4-4"
          animate={{
            pathLength: isHovered ? [0.6, 1] : 1,
            scale: isHovered ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 0.35 }}
        />

        {/* Bottom Check */}
        <motion.path
          d="m4 18 2 2 4-4"
          animate={{
            pathLength: isHovered ? [0.6, 1] : 1,
            scale: isHovered ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 0.35, delay: 0.1 }}
        />
      </svg>
    </div>
  );
}
