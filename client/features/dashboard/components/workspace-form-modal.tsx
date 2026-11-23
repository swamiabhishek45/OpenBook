"use client";

import React from "react";
import { X } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { NotebookIconPicker } from "@/features/workspaces";
import { dismissOnBackdropClick } from "@/lib/modal";
import {
  PillButton,
  SOFT_FIELD,
  iconButtonClassName,
} from "@/components/ui/pill";
import { cn } from "@/lib/utils";

export interface WorkspaceFormValues {
  title: string;
  description: string;
  icon: string;
}

interface WorkspaceFormModalProps {
  heading: string;
  blurb: string;
  submitLabel: string;
  isSubmitting: boolean;
  values: WorkspaceFormValues;
  onChange: (values: WorkspaceFormValues) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
  titlePlaceholder?: string;
}

/**
 * The create and edit notebook dialogs share this shell so the two stay in step:
 * borderless soft fields, one ink pill for the primary action.
 */
export function WorkspaceFormModal({
  heading,
  blurb,
  submitLabel,
  isSubmitting,
  values,
  onChange,
  onClose,
  onSubmit,
  titlePlaceholder = "e.g. Quantum computing research",
}: WorkspaceFormModalProps) {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.title.trim()) return;
    await onSubmit();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={heading}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
      onMouseDown={(e) => dismissOnBackdropClick(e, onClose)}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="animate-fadeIn w-full max-w-[460px] rounded-[26px] bg-card p-6 text-foreground shadow-[0_40px_80px_-24px_rgb(0_0_0/0.5)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-[24px] leading-[1.2] font-semibold tracking-[-0.03em]">
              {heading}
            </h3>
            <p className="mt-1.5 text-[14px] leading-[1.5] text-muted-foreground">
              {blurb}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(iconButtonClassName({ size: "sm" }), "-mt-1 -mr-1")}
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <NotebookIconPicker
            value={values.icon}
            onChange={(icon) => onChange({ ...values, icon })}
            label="Notebook icon"
          />

          <div className="space-y-1.5">
            <label
              htmlFor="workspace-title"
              className="text-[13px] font-medium text-foreground"
            >
              Title
            </label>
            <input
              id="workspace-title"
              type="text"
              required
              autoFocus
              value={values.title}
              onChange={(e) => onChange({ ...values, title: e.target.value })}
              placeholder={titlePlaceholder}
              className={SOFT_FIELD}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="workspace-description"
              className="text-[13px] font-medium text-foreground"
            >
              Description{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </label>
            <textarea
              id="workspace-description"
              rows={3}
              value={values.description}
              onChange={(e) => onChange({ ...values, description: e.target.value })}
              placeholder="What is this notebook about?"
              className={cn(SOFT_FIELD, "resize-none")}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <PillButton variant="chip" size="sm" onClick={onClose}>
              Cancel
            </PillButton>

            <PillButton
              type="submit"
              size="sm"
              disabled={isSubmitting || !values.title.trim()}
            >
              {isSubmitting && <ThemeLoader size={15} />}
              <span>{submitLabel}</span>
            </PillButton>
          </div>
        </form>
      </div>
    </div>
  );
}
