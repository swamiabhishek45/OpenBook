import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/* Pill buttons                                                               */
/* -------------------------------------------------------------------------- */

export type PillVariant = "ink" | "chip" | "card" | "ghost" | "danger";
export type PillSize = "xs" | "sm" | "md" | "lg";

const PILL_VARIANTS: Record<PillVariant, string> = {
  // Solid ink pill: the one primary action on a surface.
  ink: "bg-foreground text-background hover:bg-foreground/88",
  // Soft chip: secondary actions that sit beside an ink pill.
  chip: "bg-muted text-foreground hover:bg-border/70",
  // Raised chip: for use on top of a muted panel.
  card: "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.04)] hover:bg-background dark:bg-white/6 dark:shadow-none dark:hover:bg-white/10",
  // Transparent until hovered: toolbar and menu actions.
  ghost: "text-foreground/75 hover:bg-foreground/6 hover:text-foreground",
  // Destructive actions, kept quiet until hovered.
  danger: "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
};

const PILL_SIZES: Record<PillSize, string> = {
  xs: "h-7 gap-1.5 px-2.5 text-[12px]",
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
    "transition-[background-color,transform,opacity] duration-150 ease-out active:scale-[0.97]",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-45",
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

/** Pill-shaped link button. */
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

interface PillButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  variant?: PillVariant;
  size?: PillSize;
}

/** Pill-shaped button. Defaults to `type="button"` so it never submits by accident. */
export function PillButton({
  variant,
  size,
  className,
  type = "button",
  children,
  ...props
}: PillButtonProps) {
  return (
    <button
      type={type}
      className={cn(pillClassName({ variant, size, className }), "cursor-pointer")}
      {...props}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Icon button                                                                */
/* -------------------------------------------------------------------------- */

/** Round, borderless icon button: `size-9` by default, transparent until hovered. */
export function iconButtonClassName({
  tone = "ghost",
  size = "md",
  className,
}: {
  tone?: "ghost" | "danger" | "card";
  size?: "sm" | "md";
  className?: string;
} = {}) {
  return cn(
    "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full",
    "transition-[background-color,transform] duration-150 ease-out active:scale-[0.94]",
    "outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
    "disabled:pointer-events-none disabled:opacity-45",
    size === "sm" ? "size-7" : "size-9",
    tone === "ghost" && "text-muted-foreground hover:bg-foreground/6 hover:text-foreground",
    tone === "danger" && "text-muted-foreground hover:bg-destructive/10 hover:text-destructive",
    tone === "card" &&
      "bg-card text-foreground shadow-[0_1px_2px_rgb(0_0_0/0.05)] hover:bg-background dark:bg-white/6 dark:shadow-none dark:hover:bg-white/10",
    className,
  );
}

/* -------------------------------------------------------------------------- */
/* Surfaces                                                                   */
/* -------------------------------------------------------------------------- */

/** Soft, borderless surface that groups a showcase or a bento tile. */
export const PANEL = "rounded-[24px] bg-muted/60 dark:bg-muted/70";

/** A raised card sitting on top of `PANEL` or on the page background. */
export const CARD =
  "rounded-[20px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.04)] dark:shadow-[0_1px_2px_rgb(0_0_0/0.3)]";

/**
 * An element raised above a PANEL. In dark mode `--card` is darker than
 * `--muted`, so a plain `bg-card` would sink into the panel instead of lifting
 * off it; there we layer a translucent white instead.
 */
export const RAISED = "bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)] dark:bg-white/6 dark:shadow-none";

/** Hover state to pair with `RAISED` on an interactive tile. */
export const RAISED_HOVER = "hover:bg-background dark:hover:bg-white/10";

/** A floating popover / dropdown surface. Borderless, deep soft shadow. */
export const POPOVER =
  "rounded-[22px] bg-card p-2 shadow-[0_24px_60px_-18px_rgb(0_0_0/0.35)] ring-1 ring-border/50 dark:ring-white/8";

/** A row inside a POPOVER. */
export const POPOVER_ITEM =
  "flex w-full cursor-pointer items-center gap-2.5 rounded-full px-3 py-2 text-left text-[13px] font-medium transition-colors";

/** Small inline count / meta chip. */
export const META_CHIP =
  "inline-flex items-center gap-1 rounded-full bg-card px-2 py-0.5 font-mono text-[11px] text-muted-foreground dark:bg-white/6";

/** Recessed input, no border — pairs with the pill buttons. */
export const SOFT_INPUT =
  "w-full rounded-full bg-muted/70 px-4 text-[13.5px] text-foreground placeholder:text-muted-foreground/80 outline-none transition-[background-color,box-shadow] focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-muted/50 dark:focus:bg-muted/80";

/** Multi-line / boxy variant of SOFT_INPUT for forms. */
export const SOFT_FIELD =
  "w-full rounded-[16px] bg-muted/70 px-3.5 py-2.5 text-[14px] text-foreground placeholder:text-muted-foreground/80 outline-none transition-[background-color,box-shadow] focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring/25 dark:bg-muted/50 dark:focus:bg-muted/80";

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
/* Panel section heading                                                      */
/* -------------------------------------------------------------------------- */

/** The small label that heads a workspace panel or a dashboard section. */
export function PanelLabel({
  children,
  count,
  className,
}: {
  children: React.ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="text-[13px] font-semibold tracking-[-0.01em] text-foreground">
        {children}
      </span>
      {count !== undefined && <span className={META_CHIP}>{count}</span>}
    </div>
  );
}
