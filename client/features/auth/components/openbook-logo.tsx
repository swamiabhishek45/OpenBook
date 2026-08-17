import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
  textColor?: string;
  textClassName?: string;
}

export function OpenBookLogo({
  className = "",
  size = 28,
  showText = true,
  textSize = "text-2xl",
  textColor = "text-foreground",
  textClassName = "",
}: LogoProps) {
  // SVG aspect ratio is 200x120
  const width = Math.round(size * (200 / 120));
  const height = size;

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 120"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground shrink-0"
      >
        {/* Horizontal Base Line */}
        <line x1="20" y1="100" x2="180" y2="100" />

        {/* Radiating Rays from Center (100, 100) */}
        <line x1="100" y1="100" x2="25" y2="57" />
        <line x1="100" y1="100" x2="60" y2="31" />
        <line x1="100" y1="100" x2="100" y2="20" />
        <line x1="100" y1="100" x2="140" y2="31" />
        <line x1="100" y1="100" x2="175" y2="57" />
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
