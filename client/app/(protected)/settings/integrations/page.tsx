"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  FolderOpen,
  BookOpen,
  Check,
  ExternalLink,
  Shield,
  Trash2,
  Plus,
  Zap,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { cn } from "@/lib/utils";

interface IntegrationsStatus {
  googleDrive: {
    connected: boolean;
    account?: {
      metadata?: {
        email?: string;
        name?: string;
      };
      createdAt?: string;
    } | null;
  };
  notion: {
    connected: boolean;
    account?: {
      metadata?: {
        workspaceName?: string;
        avatarUrl?: string;
      };
      createdAt?: string;
    } | null;
  };
}

export default function IntegrationsSettingsPage() {
  const queryClient = useQueryClient();
  const [notionToken, setNotionToken] = useState("");
  const [notionError, setNotionError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);

  const { data: integrations, isLoading, refetch } = useQuery<IntegrationsStatus>({
    queryKey: ["connected-integrations"],
    queryFn: () => apiClient<IntegrationsStatus>("/api/integrations"),
  });

  const connectNotionMutation = useMutation({
    mutationFn: async (token: string) => {
      return await apiClient("/api/integrations/notion/connect", {
        method: "POST",
        body: JSON.stringify({ token: token.trim() }),
      });
    },
    onSuccess: () => {
      setNotionToken("");
      setNotionError(null);
      void queryClient.invalidateQueries({ queryKey: ["connected-integrations"] });
    },
    onError: (err: unknown) => {
      setNotionError(err instanceof Error ? err.message : "Failed to connect Notion.");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (provider: "google-drive" | "notion") => {
      return await apiClient(`/api/integrations/${provider}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connected-integrations"] });
    },
  });

  const handleConnectGoogleDrive = async () => {
    setGoogleError(null);
    try {
      const res = await apiClient<{ url: string }>("/api/integrations/google-drive/auth-url");
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err: unknown) {
      setGoogleError(err instanceof Error ? err.message : "Failed to get Google Drive auth URL.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Dashboard</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-xs font-semibold text-foreground">Integrations</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-10 space-y-8">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Cloud Integrations
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Connect your cloud storage and workspace tools to ingest documents directly and export notes in 1 click.
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center">
            <ThemeLoader size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Google Drive Card */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                    <FolderOpen className="w-5 h-5" />
                  </div>
                  {integrations?.googleDrive?.connected ? (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                      Not Connected
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">Google Drive</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Import Google Docs and PDF research papers directly into any notebook with live search and chunking.
                  </p>
                </div>

                {googleError && (
                  <div className="p-2.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
                    {googleError}
                  </div>
                )}

                {integrations?.googleDrive?.connected && (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                    <div className="font-medium text-foreground">
                      {integrations.googleDrive.account?.metadata?.name || "Google Account"}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      {integrations.googleDrive.account?.metadata?.email}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                {integrations?.googleDrive?.connected ? (
                  <button
                    type="button"
                    onClick={() => disconnectMutation.mutate("google-drive")}
                    disabled={disconnectMutation.isPending}
                    className="w-full py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect Google Drive</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGoogleDrive}
                    className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <span>Connect Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* 2. Notion Card */}
            <div className="p-6 rounded-2xl border border-border bg-card shadow-xs flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-muted border border-border flex items-center justify-center text-foreground">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  {integrations?.notion?.connected ? (
                    <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Connected
                    </span>
                  ) : (
                    <span className="text-[11px] font-mono text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                      Not Connected
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-sm font-bold text-foreground">Notion</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Import Notion pages as sources and export synthesized summaries, flashcards, and study guides back to Notion in 1 click.
                  </p>
                </div>

                {notionError && (
                  <div className="p-2.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
                    {notionError}
                  </div>
                )}

                {integrations?.notion?.connected ? (
                  <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-1 text-xs">
                    <div className="font-medium text-foreground">
                      {integrations.notion.account?.metadata?.workspaceName || "Connected Workspace"}
                    </div>
                    <div className="text-[11px] text-muted-foreground font-mono">
                      Export & Ingestion Active
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1">
                    <label className="block text-[11px] font-medium text-muted-foreground">
                      Notion Integration Secret Token
                    </label>
                    <input
                      type="password"
                      placeholder="secret_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                      value={notionToken}
                      onChange={(e) => setNotionToken(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Create an integration at{" "}
                      <a
                        href="https://www.notion.so/my-integrations"
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-foreground inline-flex items-center gap-0.5"
                      >
                        notion.so/my-integrations
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-border">
                {integrations?.notion?.connected ? (
                  <button
                    type="button"
                    onClick={() => disconnectMutation.mutate("notion")}
                    disabled={disconnectMutation.isPending}
                    className="w-full py-2 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Disconnect Notion</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => connectNotionMutation.mutate(notionToken)}
                    disabled={connectNotionMutation.isPending || !notionToken.trim()}
                    className="w-full py-2 bg-foreground text-background text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {connectNotionMutation.isPending ? (
                      <ThemeLoader size={14} />
                    ) : (
                      <span>Connect Notion Token</span>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
