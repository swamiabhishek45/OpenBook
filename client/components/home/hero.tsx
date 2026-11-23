import React from "react";
import { ArrowRight, FileText } from "lucide-react";
import { GithubStarButton } from "./github-star-button";
import { IconTile, PillLink } from "./primitives";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated = false }: HeroProps) {
  return (
    <section className="px-5 pt-36 sm:px-6 sm:pt-44">
      <h1 className="mx-auto max-w-[1000px] text-center text-[clamp(44px,6.8vw,96px)] leading-[1.06] font-semibold tracking-[-0.045em]">
        The research
        <br />
        <IconTile tone="ink" tilt={-4}>
          <FileText strokeWidth={2.2} />
        </IconTile>{" "}
        notebook
        <br />
        {/* The last line fades from ink to muted, like ink drying on the page. */}
        <span className="bg-linear-to-b from-foreground from-30% to-muted-foreground/55 bg-clip-text pb-[0.08em] text-transparent">
          that talks back.
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-[560px] text-center text-[19px] leading-[1.58] text-muted-foreground">
        Bring your PDFs, articles, and videos. OpenBook answers with citations, builds
        the study material for you, and turns the whole library into a podcast you can
        interrupt.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <PillLink
          href={isAuthenticated ? "/dashboard" : "/signup"}
          size="lg"
          aria-describedby="hero-fine"
        >
          {isAuthenticated ? "Open dashboard" : "Start for free"}
          <ArrowRight className="size-4" />
        </PillLink>

        <GithubStarButton />
      </div>

      <p id="hero-fine" className="mt-5 text-center text-[14px] text-muted-foreground/80">
        50 free credits to start. Open source, self-host anytime.
      </p>

      <div className="mx-auto mt-16 max-w-[1240px] rounded-[28px] bg-muted/60 p-[clamp(8px,1.6vw,20px)] sm:mt-20 dark:bg-muted/70">
        <div className="overflow-hidden rounded-[14px] bg-card shadow-[0_30px_60px_-20px_rgb(0_0_0/0.35)]">
          <video
            src="https://res.cloudinary.com/swamiabhishek45/video/upload/v1788156911/openbook/landing/openbook_demo.mp4"
            autoPlay
            loop
            muted
            playsInline
            aria-label="OpenBook demo: generating and taking a quiz from a notebook's sources"
            className="block h-auto w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
