"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedIconProps } from "./book-open";

export function AnimatedHelpCircle({
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
        {/* Outer Circle */}
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          animate={{
            scale: isHovered ? [1, 1.08, 1] : 1,
          }}
          transition={{ duration: 0.4 }}
        />

        {/* Question Mark curve */}
        <motion.path
          d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"
          animate={{
            rotate: isHovered ? [0, -10, 10, 0] : 0,
            y: isHovered ? -1 : 0,
            originX: "12px",
            originY: "10px",
          }}
          transition={{ duration: 0.45 }}
        />

        {/* Question Mark dot */}
        <motion.path
          d="M12 17h.01"
          animate={{
            scale: isHovered ? [1, 1.4, 1] : 1,
          }}
          transition={{ duration: 0.35, delay: 0.15 }}
        />
      </svg>
    </div>
  );
}
