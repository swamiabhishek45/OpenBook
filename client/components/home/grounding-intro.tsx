import React from "react";
import { BookOpenCheck, Gauge, Globe, Quote } from "lucide-react";
import { Fade, IconTile, SectionHeading } from "./primitives";

const POINTS = [
  {
    icon: Quote,
    title: "Every claim, cited.",
    body: "Answers carry citations for the exact passages they were built from.",
  },
  {
    icon: Gauge,
    title: "Only what matters.",
    body: "Retrieval picks the passages that answer you and keeps them inside the context budget.",
  },
  {
    icon: Globe,
    title: "Live web when needed.",
    body: "Toggle Tavily search and web results are cited next to your own sources.",
  },
  {
    icon: BookOpenCheck,
    title: "Check, don't trust.",
    body: "Jump from a citation straight to the page, timestamp, or paragraph it came from.",
  },
];

export function GroundingIntro() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-[1240px] scroll-mt-28 px-5 pt-32 sm:px-6 sm:pt-44"
    >
      <SectionHeading eyebrow="Grounded answers" align="center" size="lg">
        Your sources are{" "}
        <IconTile tone="ink" tilt={3}>
          <Quote strokeWidth={2.4} />
        </IconTile>{" "}
        uploaded. <Fade>Your answers still need proof.</Fade>
      </SectionHeading>

      <p className="mx-auto mt-7 max-w-[600px] text-center text-[18px] leading-[1.6] text-muted-foreground">
        Chat gives you fluent text. Search gives you raw hits. OpenBook reads across your
        whole library, picks the passages that actually answer the question, and cites
        every one of them.
      </p>

      <ul className="mt-16 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {POINTS.map(({ icon: Icon, title, body }) => (
          <li key={title} className="rounded-[20px] bg-muted/60 p-6 dark:bg-muted/70">
            <span className="flex size-11 items-center justify-center rounded-[12px] bg-card shadow-[0_1px_2px_rgb(0_0_0/0.05)]">
              <Icon className="size-5" strokeWidth={1.9} />
            </span>
            <h3 className="mt-6 text-[18px] font-semibold tracking-[-0.01em]">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-[1.55] text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
