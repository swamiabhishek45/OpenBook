"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

interface CtaSectionProps {
  isAuthenticated?: boolean;
}

export function CtaSection({ isAuthenticated = false }: CtaSectionProps) {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  return (
    <section className="relative w-full py-28 md:py-36 lg:py-44 overflow-hidden bg-[#ede8e1] dark:bg-[#121110] text-[#1c1917] dark:text-[#f5f5f4] transition-colors duration-300">
      {/* Background Subtle Grid / Ambient Texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* SVG Interconnecting Arcs */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible stroke-neutral-400/40 dark:stroke-neutral-600/30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Top-left to Experience Management to DMS */}
        <path
          d="M 16% 25% Q 18% 38% 16% 52%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* Sharepoint to HighQ arc */}
        <path
          d="M 48% 18% Q 65% 16% 75% 22%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* Sharepoint down-left towards center / DMS */}
        <path
          d="M 46% 22% Q 30% 28% 19% 46%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* HighQ to OneDrive */}
        <path
          d="M 77% 24% Q 82% 28% 81% 36%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* OneDrive swooping arc towards Intranet */}
        <path
          d="M 80% 42% Q 78% 60% 79% 75%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* Intranet sweeping curve to bottom left */}
        <path
          d="M 76% 80% Q 60% 92% 31% 88%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* Email to DMS curve */}
        <path
          d="M 30% 86% Q 25% 72% 17% 65%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
        {/* Upper subtle loop */}
        <path
          d="M 35% 20% Q 50% 12% 70% 18%"
          strokeDasharray="4 6"
          strokeWidth="1"
        />
      </svg>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Desktop Absolute Floating Cards Constellation */}
        <div className="relative min-h-[520px] sm:min-h-[560px] md:min-h-[600px] flex items-center justify-center">

          {/* ==============================================
              TOP CARD: SHAREPOINT
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("sharepoint")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute top-0 sm:top-2 left-1/2 -translate-x-1/2 z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-xl p-3.5 sm:p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08] w-[145px] sm:w-[165px]">
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-2.5 uppercase">
                SharePoint
              </div>
              <div className="h-10 w-full flex items-center justify-between gap-1 overflow-hidden">
                {/* Left group with diagonal slash */}
                <div className="relative flex items-center gap-[3px] h-full w-[45%]">
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  {/* Diagonal slash line */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-[1.5px] h-9 bg-stone-800 dark:bg-stone-200 rotate-[28deg] origin-center" />
                  </div>
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200 ml-auto" />
                </div>
                {/* Right barcode bars */}
                <div className="flex items-center gap-[2.5px] h-full w-[50%] justify-end">
                  <div className="w-[1px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1px] h-8 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================
              TOP LEFT PILL: EXPERIENCE MANAGEMENT
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("experience")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute top-12 left-4 lg:left-14 z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-lg px-3.5 py-1.5 sm:px-4 sm:py-2 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-semibold text-stone-700 dark:text-stone-300 uppercase whitespace-nowrap">
                Experience Management
              </span>
            </div>
          </div>

          {/* ==============================================
              LEFT CARD: DMS
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("dms")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute top-[44%] -translate-y-1/2 left-2 lg:left-10 z-10 transition-transform duration-500 ease-out hover:-translate-y-[52%] hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-xl p-3.5 sm:p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08] w-[110px] sm:w-[125px]">
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-2 uppercase">
                DMS
              </div>
              <div className="h-16 w-full flex flex-col justify-between py-0.5">
                {/* Stepped split vertical lines */}
                <div className="flex items-center gap-[4.5px] justify-center pl-2">
                  <div className="w-[1.5px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2.5px] h-6 bg-stone-800 dark:bg-stone-200" />
                </div>
                <div className="flex items-center gap-[4.5px] justify-center pr-2">
                  <div className="w-[2px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2.5px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1.5px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[2px] h-6 bg-stone-800 dark:bg-stone-200" />
                  <div className="w-[1px] h-6 bg-stone-800 dark:bg-stone-200" />
                </div>
              </div>
            </div>
          </div>

          {/* ==============================================
              BOTTOM LEFT PILL: EMAIL
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("email")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute bottom-6 left-[22%] lg:left-[26%] z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-lg px-3.5 py-1.5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-semibold text-stone-700 dark:text-stone-300 uppercase">
                Email
              </span>
            </div>
          </div>

          {/* ==============================================
              TOP RIGHT PILL: HIGHQ
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("highq")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute top-10 right-[16%] lg:right-[20%] z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-lg px-3.5 py-1.5 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.05)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08]">
              <span className="text-[10px] sm:text-[11px] font-mono tracking-wider font-semibold text-stone-700 dark:text-stone-300 uppercase">
                HighQ
              </span>
            </div>
          </div>

          {/* ==============================================
              RIGHT CARD: ONEDRIVE
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("onedrive")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute top-[26%] right-2 lg:right-12 z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-xl p-3 sm:p-3.5 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08] w-[120px] sm:w-[130px]">
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-2 uppercase">
                OneDrive
              </div>
              <div className="h-6 w-full flex items-center justify-center gap-[3px]">
                <div className="w-[1.5px] h-4 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1.5px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2.5px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1.5px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[3px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2px] h-5 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[3px] h-4 bg-stone-800 dark:bg-stone-200" />
              </div>
            </div>
          </div>

          {/* ==============================================
              BOTTOM RIGHT CARD: INTRANET
             ============================================== */}
          <div 
            onMouseEnter={() => setHoveredNode("intranet")}
            onMouseLeave={() => setHoveredNode(null)}
            className="hidden md:block absolute bottom-6 right-4 lg:right-16 z-10 transition-transform duration-500 ease-out hover:-translate-y-1 hover:scale-105"
          >
            <div className="bg-white/90 dark:bg-stone-900/90 backdrop-blur-xs rounded-xl p-3.5 sm:p-4 shadow-[0_12px_30px_-8px_rgba(0,0,0,0.06),0_4px_12px_-2px_rgba(0,0,0,0.03)] dark:shadow-none border border-black/[0.06] dark:border-white/[0.08] w-[120px] sm:w-[130px]">
              <div className="text-[10px] sm:text-[11px] font-mono tracking-widest text-stone-500 dark:text-stone-400 font-semibold mb-2.5 uppercase">
                Intranet
              </div>
              <div className="h-10 w-full flex items-end justify-center gap-[3px]">
                <div className="w-[1px] h-4 bg-stone-800 dark:bg-stone-200 opacity-60" />
                <div className="w-[1.5px] h-5 bg-stone-800 dark:bg-stone-200 opacity-75" />
                <div className="w-[2px] h-7 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1.5px] h-8 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2px] h-9 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2.5px] h-9 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[1.5px] h-9 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2px] h-9 bg-stone-800 dark:bg-stone-200" />
                <div className="w-[2.5px] h-9 bg-stone-800 dark:bg-stone-200" />
              </div>
            </div>
          </div>

          {/* ==============================================
              CENTER PIECE: EDITORIAL SERIF TYPOGRAPHY
             ============================================== */}
          <div className="text-center max-w-2xl sm:max-w-3xl mx-auto z-20 px-4 py-8">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-normal leading-[1.08] tracking-tight font-serif text-[#1c1917] dark:text-[#f7f5f2] select-none">
              Your collective
              <br />
              knowledge is your
              <br />
              unique asset
            </h2>

            <p className="mt-6 text-sm sm:text-base md:text-lg text-stone-600 dark:text-stone-400 font-normal tracking-normal max-w-md mx-auto">
              But it&apos;s scattered and inaccessible
            </p>

            {/* Sleek Minimal Interactive Action */}
            <div className="mt-9 flex items-center justify-center">
              <Link
                href={isAuthenticated ? "/dashboard" : "/signup"}
                className="group inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#1c1917] dark:bg-[#f7f5f2] text-[#f7f5f2] dark:text-[#1c1917] text-xs sm:text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
              >
                <span>{isAuthenticated ? "Go to Your Dashboard" : "Connect Your Knowledge"}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Adaptive Knowledge Badges */}
        <div className="md:hidden mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-4 border-t border-black/[0.08] dark:border-white/[0.08]">
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">SharePoint</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">DMS</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">OneDrive</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">Intranet</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">HighQ</div>
          </div>
          <div className="bg-white/80 dark:bg-stone-900/80 rounded-lg p-2.5 text-center border border-black/[0.06] dark:border-white/[0.08]">
            <div className="text-[10px] font-mono tracking-wider font-semibold text-stone-600 dark:text-stone-400 uppercase">Email</div>
          </div>
        </div>
      </div>
    </section>
  );
}
