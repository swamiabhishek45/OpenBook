"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

interface CtaSectionProps {
  isAuthenticated?: boolean;
}

export function CtaSection({ isAuthenticated = false }: CtaSectionProps) {
  return (
    <section className="py-20 border-t border-border bg-card/40 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-foreground" />
          <span>Get Started in Seconds</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Ready to experience the next generation of AI research?
        </h2>

        <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Create your first notebook today. Upload your materials and start learning with grounded AI.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            href={isAuthenticated ? "/dashboard" : "/signup"}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-foreground text-background text-sm font-semibold hover:opacity-90 transition-all shadow-xl active:scale-[0.99]"
          >
            <span>{isAuthenticated ? "Go to Your Dashboard" : "Create Free Account"}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {!isAuthenticated && (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl border border-border bg-card hover:bg-muted text-foreground text-sm font-medium transition-all shadow-xs"
            >
              <span>Log In to Existing Account</span>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground pt-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Private &amp; Secure</span>
          </span>
          <span>•</span>
          <span>No credit card required</span>
          <span>•</span>
          <span>Instant setup</span>
        </div>
      </div>
    </section>
  );
}
