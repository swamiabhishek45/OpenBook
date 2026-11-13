"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const DISMISS_KEY = "openbook_pwa_prompt_dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Detect if running in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 2. Check if user dismissed prompt recently (last 7 days)
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSinceDismissed =
        (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // 3. Listen for browser install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsVisible(false);
      setDeferredPrompt(null);
      localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        setIsVisible(false);
      }
    } catch (err) {
      console.error("[PWA] Installation failed:", err);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  if (!isVisible || isStandalone) {
    return null;
  }

  return (
    <aside
      aria-label="Install OpenBook app"
      className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)] sm:w-auto bg-card/95 backdrop-blur-md text-card-foreground border border-border/80 rounded-xl p-4 shadow-xl transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
      <div className="flex items-start gap-3">
        <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-border/60 bg-muted flex items-center justify-center">
          <Image
            src="/logo.svg"
            alt="OpenBook Logo"
            width={40}
            height={40}
            className="w-full h-full object-contain p-1"
          />
        </div>

        <div className="flex-1 min-w-0 pr-2">
          <h2 className="text-sm font-semibold tracking-tight leading-tight">
            Install OpenBook
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
            Add to home screen for fast offline access and native app experience.
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleInstallClick}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-muted-foreground hover:text-foreground px-2 py-1.5 rounded-md transition-colors cursor-pointer"
            >
              Not now
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}

