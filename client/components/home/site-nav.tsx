"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { OpenBookLogo } from "@/features/auth";
import { GithubIcon } from "./brand-icons";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "./links";

interface SiteNavProps {
  isAuthenticated?: boolean;
}

export function SiteNav({ isAuthenticated = false }: SiteNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
        isScrolled
          ? "border-border bg-background/85 backdrop-blur-md"
          : "border-transparent bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5 sm:px-6">
        <div className="flex items-center">
          <Link href="/" aria-label="OpenBook home" className="flex items-center">
            <OpenBookLogo size={24} textSize="text-[17px]" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="OpenBook on GitHub"
            className="inline-flex items-center text-muted-foreground/70 transition-colors hover:text-foreground"
          >
            <GithubIcon />
          </a>

          <ThemeToggle />

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="inline-flex items-center rounded-full bg-foreground px-3.5 py-1.5 text-[13px] font-medium text-background transition-opacity hover:opacity-85"
          >
            {isAuthenticated ? "Dashboard" : "Log in"}
          </Link>
        </div>
      </div>
    </header>
  );
}
