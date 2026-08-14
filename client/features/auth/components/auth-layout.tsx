import React from "react";
import Image from "next/image";
import { AuthForm } from "./auth-form";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AuthLayoutProps {
  mode: "login" | "signup";
}

export function AuthLayout({ mode }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[#0a0a0c] text-foreground flex items-center justify-center p-3 sm:p-5 lg:p-6 select-none relative">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-30">
        <ThemeToggle />
      </div>

      {/* Outer Shell container */}
      <div className="w-full max-w-350 h-[calc(100vh-2rem)] min-h-160 max-h-230 rounded-8 sm:rounded-8 overflow-hidden border border-zinc-800/60 bg-black flex flex-col lg:flex-row shadow-2xl relative">
        {/* Left Section - Cosmic Halftone Pillars Illustration */}
        <div className="relative flex-1 hidden lg:flex flex-col justify-end p-10 xl:p-14 overflow-hidden bg-black">
          {/* Background Artwork */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/login.jpg"
              alt="Cosmic Pillars Halftone Illustration"
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority
              className="object-cover object-center scale-[1.02] filter contrast-125 brightness-95"
            />
            {/* Subtle Gradient Shadow Vignette to ensure maximum text clarity */}
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent opacity-90" />
            <div className="absolute inset-0 bg-linear-to-r from-black/20 via-transparent to-black/60" />
          </div>

          {/* Left Overlay Content */}
          <div className="relative z-10 space-y-4 max-w-xl pb-2">
            <h2 className="text-3xl xl:text-4xl font-normal tracking-tight text-white leading-snug">
              Unlock insights with your documents and notes.
            </h2>
            <p className="text-xs xl:text-sm font-light text-zinc-400 tracking-wide flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>10M+ Documents Analyzed</span>
              <span className="text-zinc-600">|</span>
              <span>2M+ User Notes</span>
              <span className="text-zinc-600">|</span>
              <span>500k+ Research Summaries Today.</span>
            </p>
          </div>
        </div>

        {/* Right Section - Form Panel */}
        <div className="w-full lg:w-120 xl:w-130 flex items-center justify-center bg-[#09090b] lg:p-4 z-10 shrink-0">
          <div className="w-full h-full lg:h-auto max-w-110 lg:rounded-8 bg-[#fafafc] dark:bg-[#121214] border-0 lg:border border-zinc-200/80 dark:border-zinc-800/80 shadow-xl flex items-center justify-center">
            <React.Suspense fallback={<div className="min-h-160 w-full" />}>
              <AuthForm initialMode={mode} />
            </React.Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
