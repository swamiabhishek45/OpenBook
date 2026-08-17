"use client";

import React, { useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GooeyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
}

export function GooeyInput({
  placeholder = "Search...",
  className,
  value,
  onChange,
  onClear,
  ...props
}: GooeyInputProps) {
  const [internalValue, setInternalValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const filterId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const currentValue = value !== undefined ? value : internalValue;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      onChange(e);
    } else {
      setInternalValue(e.target.value);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else if (onChange) {
      const syntheticEvent = {
        target: { value: "" },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    } else {
      setInternalValue("");
    }
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative flex items-center", className)}>
      {/* SVG Gooey Filter */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          <filter id={`gooey-${filterId}`}>
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* Main Input Container with gooey filter backdrop and motion transitions */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
        className={cn(
          "relative flex items-center rounded-2xl border transition-colors overflow-hidden",
          isFocused || currentValue
            ? "w-64 sm:w-80 border-foreground/30 bg-card shadow-sm"
            : "w-48 sm:w-60 border-border bg-card/80 hover:bg-card hover:border-zinc-400 dark:hover:border-zinc-600"
        )}
      >
        <div className="pl-3 pr-2 flex items-center justify-center text-muted-foreground">
          <Search className="w-4 h-4" />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={currentValue}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-2 pr-3 bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          {...props}
        />

        <AnimatePresence>
          {currentValue && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              onClick={handleClear}
              className="mr-2.5 p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer shrink-0"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
