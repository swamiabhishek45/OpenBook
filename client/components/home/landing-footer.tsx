"use client";

import React from "react";
import Link from "next/link";
import { OpenBookLogo } from "@/features/auth";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/60 text-muted-foreground select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand & Tagline */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <Link href="/">
            <OpenBookLogo size={22} textSize="text-base" textColor="text-foreground" />
          </Link>
          <span className="hidden sm:inline text-border">|</span>
          <p className="text-xs text-muted-foreground">
            Next-Gen Grounded Intelligence &amp; Research Workspace.
          </p>
        </div>

        {/* Links & Copyright */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs">
          <a href="#sources" className="hover:text-foreground transition-colors">
            Sources
          </a>
          <a href="#studio" className="hover:text-foreground transition-colors">
            Studio
          </a>
          <a href="#memory" className="hover:text-foreground transition-colors">
            Memory
          </a>
          <Link href="/login" className="hover:text-foreground transition-colors">
            Sign In
          </Link>
          <span className="text-zinc-600 dark:text-zinc-400">
            &copy; {new Date().getFullYear()} OpenBook. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
