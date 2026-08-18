"use client";

import React from "react";
import {
  ReasoningText,
  type ReasoningTextVariant,
} from "./reasoning-text";

const EXAMPLES: {
  label: string;
  variant: ReasoningTextVariant;
  phrases: string[];
}[] = [
  {
    label: "Cascade",
    variant: "cascade",
    phrases: [
      "Thinking",
      "Reading the request",
      "Working through the details",
      "Preparing the answer",
    ],
  },
  {
    label: "Shimmer",
    variant: "shimmer",
    phrases: [
      "Analyzing source materials",
      "Extracting citations",
      "Formulating structured points",
    ],
  },
  {
    label: "Pulse",
    variant: "pulse",
    phrases: [
      "Reasoning across documents",
      "Checking grounded facts",
    ],
  },
];

export function ReasoningTextPreview() {
  return (
    <div className="grid w-full max-w-sm gap-6 p-5 rounded-2xl bg-card border border-border">
      {EXAMPLES.map(({ label, variant, phrases }) => (
        <div key={variant} className="grid gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/60">
            {label}
          </span>
          <ReasoningText
            variant={variant}
            phrases={phrases}
            className="text-sm"
          />
        </div>
      ))}
    </div>
  );
}
