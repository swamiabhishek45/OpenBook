"use client";

import React from "react";
import { BookOpen, ExternalLink, X } from "lucide-react";

interface NotionTokenGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotionTokenGuideModal({
  isOpen,
  onClose,
}: NotionTokenGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4 animate-fadeIn text-foreground relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-foreground" />
            <h3 className="text-xs font-bold text-foreground">
              How to Get Your Notion Token
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-3 text-xs">
          {/* Step 1 */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              1
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                Create an Integration
              </p>
              <p className="text-[11px] text-muted-foreground">
                Go to{" "}
                <a
                  href="https://www.notion.so/my-integrations"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground inline-flex items-center gap-0.5 font-medium text-foreground"
                >
                  notion.so/my-integrations
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>{" "}
                and click <strong>&quot;+ New integration&quot;</strong>. Name it <em>OpenBook</em>.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              2
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                Connect Notion Pages
              </p>
              <p className="text-[11px] text-muted-foreground">
                In Notion, open any page you want to access, click the top-right <strong>···</strong> menu ➔ <strong>Connections</strong> ➔ select <em>OpenBook</em>.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-full bg-foreground text-background text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
              3
            </div>
            <div className="space-y-0.5">
              <p className="font-semibold text-foreground">
                Copy Secret Token
              </p>
              <p className="text-[11px] text-muted-foreground">
                Under <strong>Secrets</strong>, copy the <strong>Internal Integration Secret</strong> (starts with <code className="font-mono bg-muted px-1 py-0.5 rounded text-[10px]">secret_...</code>) and paste it into OpenBook.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-foreground text-background text-xs font-semibold rounded-xl hover:opacity-90 transition-opacity cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
