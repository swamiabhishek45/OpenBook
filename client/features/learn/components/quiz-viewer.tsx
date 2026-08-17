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
      <div className="p-8 text-center text-xs text-muted-foreground">
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
        <div className="p-6 rounded-2xl bg-card border border-border text-center space-y-3 shadow-xl animate-fadeIn">
          <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-foreground">
              Quiz Completed!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              You scored <span className="text-foreground font-bold">{score}</span> out of{" "}
              <span className="text-foreground font-bold">{questions.length}</span> (
              {Math.round((score / questions.length) * 100)}%)
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-foreground text-background hover:opacity-90 text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition-colors cursor-pointer"
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

          return (
            <div
              key={qIndex}
              className="p-5 rounded-2xl bg-card border border-border space-y-4 shadow-xs"
            >
              {/* Question text */}
              <div className="flex items-start gap-3">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-mono font-semibold text-foreground shrink-0 border border-border">
                  {qIndex + 1}
                </span>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {q.question}
                </p>
              </div>

              {/* Options list */}
              <div className="space-y-2 pl-9">
                {q.options.map((opt, optIndex) => {
                  const isSelected = selectedOption === optIndex;
                  const isCorrect = optIndex === q.correctIndex;

                  let optionStyle =
                    "border-border bg-card hover:bg-muted/40 text-foreground";

                  if (showResults) {
                    if (isCorrect) {
                      optionStyle =
                        "border-emerald-500/80 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 font-medium";
                    } else if (isSelected && !isCorrect) {
                      optionStyle =
                        "border-red-500/80 bg-red-500/10 text-red-600 dark:text-red-300";
                    }
                  } else if (isSelected) {
                    optionStyle =
                      "border-primary bg-muted font-medium shadow-xs";
                  }

                  return (
                    <button
                      key={optIndex}
                      type="button"
                      onClick={() => handleSelectOption(qIndex, optIndex)}
                      className={cn(
                        "w-full p-3 rounded-xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer",
                        optionStyle
                      )}
                    >
                      <span className="pr-3 leading-relaxed">{opt}</span>
                      {showResults && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      )}
                      {showResults && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation Reveal */}
              {showResults && q.explanation && (
                <div className="ml-9 p-3 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground space-y-1">
                  <span className="font-semibold text-foreground block">
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
            className="px-6 py-2.5 bg-foreground text-background hover:opacity-90 text-xs font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer"
          >
            Submit &amp; Check Answers
          </button>
        </div>
      )}
    </div>
  );
}
