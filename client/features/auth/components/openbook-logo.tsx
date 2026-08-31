import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
  textColor?: string;
  textClassName?: string;
  iconClassName?: string;
}

export function OpenBookLogo({
  className = "",
  size = 28,
  showText = true,
  textSize = "text-2xl",
  textColor = "text-foreground",
  textClassName = "",
  iconClassName = "",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${iconClassName}`}
      >
        {/* Solid rounded square background */}
        <rect
          width="200"
          height="200"
          rx="44"
          className="fill-foreground"
        />

        {/* Radiating Rays from Center (100, 134) */}
        <g
          className="stroke-background"
          strokeWidth="12"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Horizontal Base Line */}
          <line x1="36" y1="134" x2="164" y2="134" />

          {/* Radiating Rays */}
          <line x1="100" y1="134" x2="40" y2="100" />
          <line x1="100" y1="134" x2="68" y2="76" />
          <line x1="100" y1="134" x2="100" y2="66" />
          <line x1="100" y1="134" x2="132" y2="76" />
          <line x1="100" y1="134" x2="160" y2="100" />
        </g>
      </svg>

      {showText && (
        <span
          className={`font-serif tracking-tight font-medium ${textSize} ${textColor} ${textClassName}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          OpenBook
        </span>
      )}
    </div>
  );
}
