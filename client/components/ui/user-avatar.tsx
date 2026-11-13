"use client";

import React, { useState } from "react";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

export function UserAvatar({
  src,
  name,
  className,
  fallbackClassName,
  referrerPolicy = "no-referrer",
}: UserAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const initial = name?.trim() ? name.trim().charAt(0).toUpperCase() : null;

  if (src && !hasError) {
    return (
      <img
        src={src}
        alt={name || "User Avatar"}
        referrerPolicy={referrerPolicy}
        crossOrigin="anonymous"
        onError={() => setHasError(true)}
        className={cn("w-full h-full object-cover rounded-full", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "w-full h-full rounded-full flex items-center justify-center font-semibold text-foreground bg-secondary/80 select-none text-xs",
        fallbackClassName
      )}
    >
      {initial ? (
        <span>{initial}</span>
      ) : (
        <User className="w-1/2 h-1/2 text-muted-foreground" />
      )}
    </div>
  );
}

