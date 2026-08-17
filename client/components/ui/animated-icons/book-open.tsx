"use client";

import { motion } from "motion/react";
import React, { useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  isHovered?: boolean;
}

export function AnimatedBookOpen({
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
        {/* Spine */}
        <line x1="12" y1="6" x2="12" y2="20" />

        {/* Left Page */}
        <motion.path
          d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"
          animate={{
            rotateY: isHovered ? -18 : 0,
            originX: 1,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />

        {/* Right Page */}
        <motion.path
          d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"
          animate={{
            rotateY: isHovered ? 18 : 0,
            originX: 0,
          }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        />
      </svg>
    </div>
  );
}
