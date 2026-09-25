"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type IntegrationCardProps = {
  title: string;
  description: string;
  connected: boolean;
  icon: ReactNode;
  iconClassName?: string;
  children?: ReactNode;
  footer: ReactNode;
};

export function IntegrationCard({
  title,
  description,
  connected,
  icon,
  iconClassName,
  children,
  footer,
}: IntegrationCardProps) {
  return (
    <article
      className="flex h-full min-h-[22rem] flex-col rounded-2xl border border-border bg-card p-5 shadow-xs sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-xl border border-border bg-background shadow-sm",
            iconClassName,
          )}
        >
          {icon}
        </div>
        {connected ? (
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400"
          >
            <Check className="size-3" aria-hidden />
            Connected
          </span>
        ) : (
          <span
            className="shrink-0 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Not connected
          </span>
        )}
      </div>

      <div className="mt-4 space-y-1.5">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-3 min-h-[7.5rem]">
        {children}
      </div>

      <div className="mt-4 border-t border-border pt-4">{footer}</div>
    </article>
  );
}
