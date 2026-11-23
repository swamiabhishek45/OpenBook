"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OpenBookLogo } from "@/features/auth";
import { GithubIcon } from "./brand-icons";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { cn } from "@/lib/utils";
import { GITHUB_URL } from "./links";
import { PillLink } from "./primitives";

interface SiteNavProps {
  isAuthenticated?: boolean;
}

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Studio", href: "/#studio" },
  { label: "Pricing", href: "/pricing" },
  { label: "FAQ", href: "/#faq" },
];

export function SiteNav({ isAuthenticated = false }: SiteNavProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6 sm:pt-3.5">
      <nav
        aria-label="Main"
        className={cn(
          "mx-auto flex h-[60px] w-full max-w-[1140px] items-center justify-between rounded-full py-2 pr-2 pl-5",
          "backdrop-blur-xl transition-[background-color,box-shadow] duration-300",
          isScrolled
            ? "bg-muted/85 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] dark:bg-muted/80"
            : "bg-muted/70 dark:bg-muted/60",
        )}
      >
        <div className="flex items-center gap-7">
          <Link href="/" aria-label="OpenBook home" className="flex items-center">
            <OpenBookLogo size={26} textSize="text-[18px]" />
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="rounded-full px-3 py-2 text-[14.5px] font-medium text-foreground/80 transition-colors hover:bg-foreground/6 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="OpenBook on GitHub"
            className="hidden size-9 items-center justify-center rounded-full text-foreground/70 transition-colors hover:bg-foreground/6 hover:text-foreground sm:inline-flex"
          >
            <GithubIcon />
          </a>

          <ThemeToggle className="size-9 rounded-full border-0 bg-transparent shadow-none hover:bg-foreground/6" />

          {!isAuthenticated && (
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-2 text-[14.5px] font-medium text-foreground/80 transition-colors hover:text-foreground sm:inline-flex"
            >
              Sign in
            </Link>
          )}

          <PillLink href={isAuthenticated ? "/dashboard" : "/signup"} size="md">
            {isAuthenticated ? "Dashboard" : "Get started"}
            <ArrowRight className="size-3.5" />
          </PillLink>
        </div>
      </nav>
    </header>
  );
}
