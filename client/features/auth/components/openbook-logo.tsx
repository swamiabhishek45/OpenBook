import React from "react";

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textSize?: string;
  textColor?: string;
}

export function OpenBookLogo({
  className = "",
  size = 28,
  showText = true,
  textSize = "text-2xl",
  textColor = "text-foreground",
}: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Pixelated geometric open rosette circle matching brand identity */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        className="text-foreground shrink-0"
      >
        <rect x="10" y="2" width="4" height="3" rx="0.5" />
        <rect x="18" y="2" width="4" height="3" rx="0.5" />
        <rect x="23" y="5" width="4" height="3" rx="0.5" />
        <rect x="5" y="5" width="4" height="3" rx="0.5" />
        <rect x="27" y="10" width="3" height="4" rx="0.5" />
        <rect x="2" y="10" width="3" height="4" rx="0.5" />
        <rect x="27" y="18" width="3" height="4" rx="0.5" />
        <rect x="2" y="18" width="3" height="4" rx="0.5" />
        <rect x="23" y="24" width="4" height="3" rx="0.5" />
        <rect x="5" y="24" width="4" height="3" rx="0.5" />
        <rect x="10" y="27" width="4" height="3" rx="0.5" />
        <rect x="18" y="27" width="4" height="3" rx="0.5" />
      </svg>

      {showText && (
        <span
          className={`font-serif tracking-tight font-medium ${textSize} ${textColor}`}
          style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
        >
          OpenBook
        </span>
      )}
    </div>
  );
}
