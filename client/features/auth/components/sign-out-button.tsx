"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "../lib/auth-client";
import { authRoutes } from "../lib/auth-routes";
import { LogOut } from "lucide-react";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";

interface SignOutButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  children?: React.ReactNode;
  iconOnly?: boolean;
}

export function SignOutButton({
  className,
  children,
  iconOnly = false,
  ...props
}: SignOutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleSignOut() {
    setIsLoading(true);

    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push(authRoutes.login);
            router.refresh();
          },
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={isLoading || props.disabled}
      title="Sign out"
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50",
        iconOnly && "p-1.5 border-0 bg-transparent hover:bg-muted",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <ThemeLoader size={14} />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      {!iconOnly && (children || <span>Sign out</span>)}
    </button>
  );
}
