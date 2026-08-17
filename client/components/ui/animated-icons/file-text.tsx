"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { AnimatedIconProps } from "./book-open";

export function AnimatedFileText({
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
        {/* Document outline */}
        <motion.path
          d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"
          animate={{
            scale: isHovered ? [1, 1.04, 1] : 1,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Folded corner */}
        <motion.path
          d="M14 2v4a2 2 0 0 0 2 2h4"
          animate={{
            rotate: isHovered ? [0, -5, 0] : 0,
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Text line 1 */}
        <motion.path
          d="M10 9H8"
          animate={{
            x: isHovered ? [0, 2, 0] : 0,
          }}
          transition={{ duration: 0.3, delay: 0.05 }}
        />

        {/* Text line 2 */}
        <motion.path
          d="M16 13H8"
          animate={{
            x: isHovered ? [0, 2, 0] : 0,
          }}
          transition={{ duration: 0.3, delay: 0.1 }}
        />

        {/* Text line 3 */}
        <motion.path
          d="M16 17H8"
          animate={{
            x: isHovered ? [0, 2, 0] : 0,
          }}
          transition={{ duration: 0.3, delay: 0.15 }}
        />
      </svg>
    </div>
  );
}
