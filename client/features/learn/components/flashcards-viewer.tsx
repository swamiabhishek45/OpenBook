"use client";

import React, { useState } from "react";
import { FlashcardItem } from "../types";
import { ChevronLeft, ChevronRight, RotateCw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardsViewerProps {
  cards: FlashcardItem[];
}

export function FlashcardsViewer({ cards: initialCards }: FlashcardsViewerProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-muted-foreground">
        No flashcards available.
      </div>
    );
  }

  const currentCard = cards[currentIndex] as unknown as Record<string, unknown> | undefined;
  const frontText =
    (currentCard?.front as string) ||
    (currentCard?.question as string) ||
    (currentCard?.term as string) ||
    "No question text";
  const backText =
    (currentCard?.back as string) ||
    (currentCard?.answer as string) ||
    (currentCard?.definition as string) ||
    (currentCard?.explanation as string) ||
    "No answer text";

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  return (
    <div className="flex flex-col items-center justify-between w-full max-w-xl mx-auto space-y-5 select-none">
      {/* Top Controls */}
      <div className="w-full flex items-center justify-between text-xs text-muted-foreground font-mono px-2">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* 3D Interactive Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-80 cursor-pointer"
        style={{ perspective: "1000px" }}
      >
        <div
          className="relative w-full h-full rounded-2xl transition-transform duration-500 shadow-xl"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front Face (Question) */}
          <div
            className="absolute inset-0 p-8 rounded-2xl border border-border bg-card flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground font-mono">
                Question / Concept
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-primary animate-pulse" />
                Click to reveal answer
              </span>
            </div>

            <p className="text-base sm:text-lg font-medium text-foreground text-center leading-relaxed my-auto px-4 overflow-y-auto max-h-44">
              {frontText}
            </p>

            <div className="text-[11px] text-muted-foreground/70 text-center font-mono">
              Front Side
            </div>
          </div>

          {/* Back Face (Answer) */}
          <div
            className="absolute inset-0 p-8 rounded-2xl border border-emerald-500/30 bg-card flex flex-col justify-between"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Answer / Definition
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <RotateCw className="w-3 h-3 text-emerald-400" />
                Click to flip back
              </span>
            </div>

            <p className="text-sm sm:text-base text-foreground text-center leading-relaxed my-auto px-4 overflow-y-auto max-h-44">
              {backText}
            </p>

            <div className="text-[11px] text-muted-foreground/70 text-center font-mono">
              Back Side
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1.5 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-medium border border-border transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1.5 px-5 py-2 bg-foreground hover:opacity-90 text-background rounded-xl text-xs font-medium transition-colors shadow-xs cursor-pointer"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

