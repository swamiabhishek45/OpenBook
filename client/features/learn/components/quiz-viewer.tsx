"use client";

import React, { useState } from "react";
import { QuizQuestion } from "../types";
import { CheckCircle2, XCircle, RefreshCw, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizViewerProps {
  questions: QuizQuestion[];
}

export function QuizViewer({ questions }: QuizViewerProps) {
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-zinc-500">
        No quiz questions available.
      </div>
    );
  }

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (showResults) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowResults(false);
  };

  const isAllAnswered = questions.every((_, idx) => userAnswers[idx] !== undefined);
  const score = calculateScore();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 select-none">
      {/* Score Banner when completed */}
      {showResults && (
        <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-700 text-center space-y-3 shadow-xl animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">
              Quiz Completed!
            </h3>
            <p className="text-sm text-zinc-300 mt-1">
              You scored <span className="text-white font-bold">{score}</span> out of{" "}
              <span className="text-white font-bold">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%)
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retake Quiz</span>
          </button>
        </div>
      )}

      {/* Questions list */}
      <div className="space-y-6">
        {questions.map((q, qIndex) => {
          const selectedOption = userAnswers[qIndex];
          const isAnswered = selectedOption !== undefined;

          return (
            <div
              key={qIndex}
              className="p-5 rounded-2xl bg-zinc-950/80 border border-zinc-800/90 space-y-4"
            >
              {/* Question text */}
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-xs font-mono font-semibold text-zinc-300 shrink-0">
                  {qIndex + 1}
                </span>
                <p className="text-sm font-medium text-white leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrect = optIndex === q.correctIndex;

                  let optionStyle =
                    "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300";

                  if (showResults) {
                    if (isCorrect) {
                      optionStyle =
                        "border-emerald-700/80 bg-emerald-950/40 text-emerald-200 font-medium";
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        "border-red-800/80 bg-red-950/40 text-red-300";
                    }
                  } else if (isSelected) {
                    optionStyle =
                      "border-white bg-zinc-800 text-white font-medium shadow-xs";
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={cn(
                        "w-full p-3 rounded-xl border text-xs text-left flex items-center justify-between transition-all",
                        optionStyle
                      )}
                    >
                      <span className="pr-3 leading-relaxed">{opt}</span>
                      {showResults && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {showResults && q.explanation && (
                <div className="ml-9 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 space-y-1">
                  <span className="font-semibold text-zinc-300 block">
                    Explanation:
                  </span>
                  <p className="leading-relaxed">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit button */}
      {!showResults && (
        <div className="flex justify-end pt-2">
          <button
            onClick={() => setShowResults(true)}
            disabled={!isAllAnswered}
            className="px-6 py-2.5 bg-white hover:bg-zinc-200 text-black text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
          >
            Submit &amp; Check Answers
          </button>
        </div>
      )}
    </div>
  );
}
