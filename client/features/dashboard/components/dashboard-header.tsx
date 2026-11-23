"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { LogOut, CreditCard, Puzzle, Brain, ChevronDown } from "lucide-react";
import { OpenBookLogo } from "@/features/auth";
import { ThemeToggle } from "@/components/motion/theme-toggle";
import { PremiumAvatar, ProBadge, useUsage } from "@/features/billing";
import { UserAvatar } from "@/components/ui/user-avatar";
import { POPOVER, POPOVER_ITEM } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

interface DashboardHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  onLogout: () => void;
}

const ACCOUNT_LINKS = [
  { label: "Credits & billing", href: "/settings/billing", icon: CreditCard },
  { label: "Integrations", href: "/settings/integrations", icon: Puzzle },
  { label: "Memory", href: "/settings/memory", icon: Brain },
];

export function DashboardHeader({ user, onLogout }: DashboardHeaderProps) {
  const { plan } = useUsage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Same scroll-reactive chrome as the landing nav.
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 px-3 pt-3 sm:px-6 sm:pt-3.5">
      <nav
        aria-label="Dashboard"
        className={cn(
          "mx-auto flex h-[60px] w-full max-w-[1240px] items-center justify-between rounded-full py-2 pr-2 pl-5",
          "backdrop-blur-xl transition-[background-color,box-shadow] duration-300",
          isScrolled
            ? "bg-muted/85 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.18)] dark:bg-muted/80"
            : "bg-muted/70 dark:bg-muted/60",
        )}
      >
        <Link
          href="/dashboard"
          aria-label="OpenBook dashboard"
          className="flex items-center"
        >
          <OpenBookLogo size={26} textSize="text-[18px]" textColor="text-foreground" />
        </Link>

        <div className="flex items-center gap-1.5">
          <ProBadge className="hidden md:inline-flex" />

          <ThemeToggle className="size-9 rounded-full border-0 bg-transparent shadow-none hover:bg-foreground/6" />

          {/* Account menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((open) => !open)}
              aria-expanded={isMenuOpen}
              aria-haspopup="menu"
              className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full bg-card pr-2.5 pl-1 shadow-[0_1px_2px_rgb(0_0_0/0.04)] transition-colors hover:bg-background focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              <PremiumAvatar plan={plan} size="sm" className="size-7">
                <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-[11px] font-semibold text-foreground">
                  <UserAvatar src={user.image} name={user.name} />
                </div>
              </PremiumAvatar>

              <span className="hidden max-w-32 truncate text-[13px] font-medium text-foreground sm:inline">
                {user.name || user.email}
              </span>

              <ChevronDown
                className={cn(
                  "size-3.5 shrink-0 text-muted-foreground transition-transform duration-200",
                  isMenuOpen && "rotate-180",
                )}
              />
            </button>

            {isMenuOpen && (
              <div
                className={cn(POPOVER, "animate-fadeIn absolute top-full right-0 z-50 mt-2 w-60")}
              >
                <div className="flex items-center gap-2.5 px-3 pt-1.5 pb-3">
                  <PremiumAvatar plan={plan} size="md" className="size-9">
                    <div className="flex size-full items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-semibold text-foreground">
                      <UserAvatar src={user.image} name={user.name} />
                    </div>
                  </PremiumAvatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-semibold text-foreground">
                      {user.name || "User"}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="space-y-0.5">
                  {ACCOUNT_LINKS.map(({ label, href, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(POPOVER_ITEM, "text-foreground hover:bg-foreground/6")}
                    >
                      <Icon className="size-4 text-muted-foreground" />
                      <span>{label}</span>
                    </Link>
                  ))}
                </div>

                <div className="mt-1 border-t border-border/60 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className={cn(POPOVER_ITEM, "text-destructive hover:bg-destructive/10")}
                  >
                    <LogOut className="size-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}
