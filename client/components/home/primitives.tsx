import React from "react";
import { cn } from "@/lib/utils";

// The pill buttons and soft surfaces are shared with the signed-in app, so they
// live in components/ui/pill.tsx. Re-exported here to keep the landing imports
// pointing at one place.
export {
  pillClassName,
  PillLink,
  PillButton,
  PANEL,
  CARD,
  POPOVER,
  IconTile,
  type TileTone,
} from "@/components/ui/pill";

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
