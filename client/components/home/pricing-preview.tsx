import React from "react";
import { ArrowRight, Check, Gift } from "lucide-react";
import { cn } from "@/lib/utils";
import { PRICING_PLANS } from "@/features/billing/lib/plans";
import { Fade, IconTile, PillLink, SectionHeading } from "./primitives";

interface PricingPreviewProps {
  isAuthenticated?: boolean;
}

export function PricingPreview({ isAuthenticated = false }: PricingPreviewProps) {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="mx-auto w-full max-w-[1240px] scroll-mt-28 px-5 pt-32 sm:px-6 sm:pt-44"
    >
      <SectionHeading id="pricing-title" eyebrow="Pricing" align="center" size="lg">
        Start free.{" "}
        <IconTile tone="green" tilt={-5}>
          <Gift strokeWidth={2.2} />
        </IconTile>{" "}
        <Fade>Pay only for what you use.</Fade>
      </SectionHeading>

      <p className="mx-auto mt-6 max-w-[520px] text-center text-[18px] leading-[1.6] text-muted-foreground">
        Credits, not subscriptions. They never expire, and higher packs come with a bonus.
      </p>

      <div className="mt-16 grid gap-3 rounded-[28px] bg-muted/60 p-2.5 md:grid-cols-3 dark:bg-muted/70">
        {PRICING_PLANS.map((plan) => {
          const featured = !!plan.isPopular;

          return (
            <article
              key={plan.id}
              className={cn(
                "flex flex-col rounded-[22px] p-7",
                featured ? "bg-card shadow-[0_12px_32px_-16px_rgb(0_0_0/0.22)]" : "bg-transparent"
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[20px] font-semibold tracking-[-0.02em]">{plan.name}</h3>
                {featured && (
                  <span className="rounded-full bg-foreground px-2.5 py-1 font-mono text-[11px] text-background">
                    most picked
                  </span>
                )}
              </div>
              <p className="mt-2 text-[15px] leading-[1.5] text-muted-foreground">
                {plan.description}
              </p>

              <ul className="mt-6 flex flex-col gap-2.5 border-t border-border/70 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5 text-[14.5px] leading-[1.45]">
                    <Check className="mt-0.5 size-4 shrink-0 text-[#3fae5a]" strokeWidth={2.5} />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-auto pt-8">
                {plan.id === "FREE" ? (
                  <PillLink
                    href={isAuthenticated ? "/dashboard" : "/signup"}
                    variant={featured ? "ink" : "card"}
                    className="w-full"
                  >
                    {isAuthenticated ? "Open dashboard" : "Start with 50 credits"}
                  </PillLink>
                ) : (
                  <PillLink
                    href="/pricing"
                    variant={featured ? "ink" : "card"}
                    className="w-full"
                  >
                    See {plan.name.toLowerCase()} pricing
                    <ArrowRight className="size-3.5" />
                  </PillLink>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
