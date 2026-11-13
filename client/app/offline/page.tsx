"use client";

import Link from "next/link";
import { WifiOff, RefreshCw, BookOpen } from "lucide-react";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="w-16 h-16 rounded-2xl bg-muted/60 border border-border flex items-center justify-center mb-6 shadow-sm">
        <WifiOff className="w-8 h-8 text-muted-foreground animate-pulse" />
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 mb-4">
        <span>Offline Mode</span>
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        You're currently offline
      </h1>

      <p className="text-muted-foreground max-w-md mb-8 text-sm leading-relaxed">
        It looks like you've lost your internet connection. Cached pages and
        previously loaded notebooks may still be available.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>

        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-secondary/80 transition-colors border border-border"
        >
          <BookOpen className="w-4 h-4" />
          <span>Go to Home</span>
        </Link>
      </div>
    </div>
  );
}
