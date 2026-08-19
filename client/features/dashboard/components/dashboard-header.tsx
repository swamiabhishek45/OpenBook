"use client";

import React from "react";
import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { OpenBookLogo } from "@/features/auth";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { PremiumAvatar, ProBadge, useUsage } from "@/features/billing";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onLogout: () => void;
}

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { plan } = useUsage();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="flex items-center gap-2">
          <OpenBookLogo size={26} textSize="text-xl" textColor="text-foreground" />
        </Link>
      </div>

      {/* User profile & theme actions */}
      <div className="flex items-center gap-3">
        <ProBadge />

        <ThemeToggle />

        <div className="h-4 w-px bg-border mx-1" />

        {/* User profile pill */}
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg border border-border bg-card">
          <PremiumAvatar plan={plan} size="sm" className="w-6 h-6">
            <div className="w-full h-full rounded-full bg-muted border border-border flex items-center justify-center text-xs font-semibold text-foreground overflow-hidden">
              {user.image ? (
                <img
                  src={user.image}
                  alt={user.name || "Profile"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : user.name ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <User className="w-3.5 h-3.5" />
              )}
            </div>
          </PremiumAvatar>

          <span className="text-xs text-muted-foreground hidden sm:inline max-w-30 truncate">
            {user.name || user.email}
          </span>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
