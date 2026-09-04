import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GithubStarButton } from "./github-star-button";

interface HeroProps {
  isAuthenticated?: boolean;
}

export function Hero({ isAuthenticated = false }: HeroProps) {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 pt-28 sm:px-6 sm:pt-36">
      <h1 className="mx-auto max-w-3xl text-center font-serif text-[40px] leading-[1.15] tracking-tight sm:text-6xl">
        The research notebook
        <br />
        <span className="inline-flex items-center justify-center gap-3 sm:gap-4">
          {/* Light theme: use dark gif for contrast on light background */}
          <img
            src="/dark-lodaer.gif"
            alt="AI active"
            className="inline-block h-[1.15em] sm:h-[1.2em] w-auto object-contain dark:hidden"
          />
          {/* Dark theme: use light gif for contrast on dark background */}
          <img
            src="/light-loader.gif"
            alt="AI active"
            className="hidden h-[1.15em] sm:h-[1.2em] w-auto object-contain dark:inline-block"
          />
          <span>that talks back.</span>
        </span>
      </h1>

      <p className="mx-auto mt-6 max-w-xl text-center text-[15px] leading-relaxed text-muted-foreground">
        Bring your PDFs, articles, and videos. OpenBook answers with citations, builds
        the study material for you, and turns the whole library into a podcast you can
        interrupt.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href={isAuthenticated ? "/dashboard" : "/signup"}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          {isAuthenticated ? "Open dashboard" : "Get started"}
          <ArrowRight className="size-3.5" />
        </Link>

        <GithubStarButton />
      </div>

      <div className="mt-14 overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-black/5 dark:shadow-black/30 sm:mt-20">
        <video
          src="https://res.cloudinary.com/swamiabhishek45/video/upload/v1788156911/openbook/landing/openbook_demo.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto object-cover block"
        />
      </div>
    </section>
  );
}
