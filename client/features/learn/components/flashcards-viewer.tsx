"use client";

import React, { useState } from "react";
import { FlashcardItem } from "../types";
import { ChevronLeft, ChevronRight, RotateCw, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardsViewerProps {
  cards: FlashcardItem[];
}

export function FlashcardsViewer({ cards: initialCards }: FlashcardsViewerProps) {
  const [cards, setCards] = useState<FlashcardItem[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        No flashcards available.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

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
      <div className="w-full flex items-center justify-between text-xs text-zinc-400 font-mono px-2">
        <span>
          Card {currentIndex + 1} of {cards.length}
        </span>
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors"
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Shuffle</span>
        </button>
      </div>

      {/* 3D Interactive Flip Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full h-72 cursor-pointer perspective-1000"
      >
        <div
          className={cn(
            "relative w-full h-full rounded-2xl border transition-all duration-500 transform-style-preserve-3d shadow-xl p-8 flex flex-col justify-between",
            isFlipped
              ? "bg-zinc-900 border-zinc-700 [transform:rotateY(180deg)]"
              : "bg-zinc-950 border-zinc-800 hover:border-zinc-700"
          )}
        >
          {/* Front Face (Question) */}
          <div
            className={cn(
              "absolute inset-0 p-8 flex flex-col justify-between backface-hidden",
              isFlipped ? "invisible" : "visible"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 font-mono">
                Question / Concept
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Click to reveal answer
              </span>
            </div>

            <p className="text-base sm:text-lg font-medium text-white text-center leading-relaxed my-auto">
              {currentCard?.front}
            </p>

            <div className="text-[11px] text-zinc-600 text-center">
              Front Side
            </div>
          </div>

          {/* Back Face (Answer) */}
          <div
            className={cn(
              "absolute inset-0 p-8 flex flex-col justify-between backface-hidden [transform:rotateY(180deg)]",
              isFlipped ? "visible" : "invisible"
            )}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                Answer / Definition
              </span>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <RotateCw className="w-3 h-3" />
                Click to flip back
              </span>
            </div>

            <p className="text-sm sm:text-base text-zinc-200 text-center leading-relaxed my-auto">
              {currentCard?.back}
            </p>

            <div className="text-[11px] text-zinc-600 text-center">
              Back Side
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center gap-4 pt-2">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-medium border border-zinc-800 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-4 py-2 bg-white hover:bg-zinc-200 text-black rounded-xl text-xs font-medium transition-colors shadow-xs"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
