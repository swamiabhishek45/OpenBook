import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Pill buttons                                                               */
/* -------------------------------------------------------------------------- */

type PillVariant = "ink" | "chip" | "card";
type PillSize = "sm" | "md" | "lg";

const PILL_VARIANTS: Record<PillVariant, string> = {
  // Solid ink pill: the one primary action on a surface.
  ink: "bg-foreground text-background hover:bg-foreground/88",
  // Soft chip: secondary actions that sit beside an ink pill.
  chip: "bg-muted text-foreground hover:bg-border/70",
  // Raised chip: for use on top of a muted panel.
  card: "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-background",
};

const PILL_SIZES: Record<PillSize, string> = {
  sm: "h-9 gap-2 px-3.5 text-[13px]",
  md: "h-11 gap-2 pl-[18px] pr-4 text-[14.5px]",
  lg: "h-[52px] gap-[9px] px-[26px] text-[16px]",
};

export function pillClassName({
  variant = "ink",
  size = "md",
  className,
}: {
  variant?: PillVariant;
  size?: PillSize;
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 items-center justify-center rounded-full font-medium whitespace-nowrap",
    "transition-[background-color,transform] duration-150 ease-out active:scale-[0.97]",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "[&_svg]:shrink-0",
    PILL_VARIANTS[variant],
    PILL_SIZES[size],
    className,
  );
}

interface PillLinkProps extends React.ComponentPropsWithoutRef<"a"> {
  href: string;
  variant?: PillVariant;
  size?: PillSize;
  external?: boolean;
}

/** Pill-shaped link button used across the landing page. */
export function PillLink({
  href,
  variant,
  size,
  external,
  className,
  children,
  ...props
}: PillLinkProps) {
  const classes = pillClassName({ variant, size, className });

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={classes}
        {...props}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes} {...props}>
      {children}
    </Link>
  );
}

/* -------------------------------------------------------------------------- */
/* Inline icon tile                                                           */
/* -------------------------------------------------------------------------- */

const TILE_TONES = {
  ink: "bg-foreground text-background",
  card: "bg-card text-foreground ring-1 ring-border",
  red: "bg-[#ff0033] text-white",
  green: "bg-[#3fae5a] text-white",
  amber: "bg-[#e9a23b] text-white",
  blue: "bg-[#3b6fe0] text-white",
} as const;

export type TileTone = keyof typeof TILE_TONES;

/**
 * A rounded square sized in `em`, so it scales with the headline it sits in.
 * Purely decorative: give the surrounding sentence the meaning.
 */
export function IconTile({
  children,
  tone = "ink",
  tilt = 0,
  className,
}: {
  children: React.ReactNode;
  tone?: TileTone;
  tilt?: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={tilt ? { transform: `rotate(${tilt}deg)` } : undefined}
      // overflow-hidden pins an inline-block's baseline to its bottom edge (otherwise
      // Chrome borrows the icon's), so align-[-0.08em] seats it just under the text.
      className={cn(
        "mx-[0.06em] inline-block size-[0.8em] overflow-hidden rounded-[0.22em] align-[-0.08em]",
        "shadow-[0_0.08em_0.2em_rgb(0_0_0/0.12)] [&_svg]:size-[0.46em] [&_img]:size-[0.5em]",
        TILE_TONES[tone],
        className,
      )}
    >
      <span className="flex size-full items-center justify-center">{children}</span>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Section heading                                                            */
/* -------------------------------------------------------------------------- */

export function Eyebrow({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-[15px] text-muted-foreground", className)}>{children}</p>
  );
}

/** The gray second half of a headline. */
export function Fade({ children }: { children: React.ReactNode }) {
  return <span className="text-muted-foreground/65">{children}</span>;
}

export function SectionHeading({
  eyebrow,
  children,
  align = "left",
  size = "md",
  className,
  id,
}: {
  eyebrow?: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "center";
  size?: "md" | "lg";
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2
        id={id}
        className={cn(
          "mt-2.5 font-semibold tracking-[-0.035em] text-balance",
          size === "lg"
            ? "text-[clamp(36px,4.8vw,64px)] leading-[1.14]"
            : "text-[clamp(34px,4.2vw,56px)] leading-[1.14]",
          align === "center" && "mx-auto max-w-[920px]",
        )}
      >
        {children}
      </h2>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

/** Soft, borderless surface that groups a showcase or a bento tile. */
export const PANEL = "rounded-[24px] bg-muted/60 dark:bg-muted/70";
