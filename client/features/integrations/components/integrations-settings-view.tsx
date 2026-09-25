"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Trash2, Puzzle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { ThemeLoader } from "@/components/ui/theme-loader";
import { GithubIcon } from "@/components/ui/github-icon";
import {
  GoogleDriveIcon,
  NotionIcon,
} from "@/components/ui/integration-brand-icons";
import { IntegrationCard } from "./integration-card";

interface IntegrationsStatus {
  googleDrive: {
    connected: boolean;
    account?: {
      metadata?: { email?: string; name?: string };
      createdAt?: string;
    } | null;
  };
  notion: {
    connected: boolean;
    account?: {
      metadata?: { workspaceName?: string; avatarUrl?: string };
      createdAt?: string;
    } | null;
  };
  github: {
    connected: boolean;
    account?: {
      metadata?: { login?: string; name?: string; avatarUrl?: string };
      createdAt?: string;
    } | null;
  };
}

type IntegrationsSettingsViewProps = {
  workspaceId?: string;
};

const actionBtnPrimary =
  "w-full py-2.5 bg-foreground text-background text-xs font-semibold rounded-xl transition-opacity hover:opacity-90 cursor-pointer shadow-xs flex items-center justify-center gap-1.5 disabled:opacity-50";
const actionBtnDanger =
  "w-full py-2.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 border border-transparent hover:border-destructive/20 transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50";

export function IntegrationsSettingsView({
  workspaceId,
}: IntegrationsSettingsViewProps) {
  const queryClient = useQueryClient();
  const [notionToken, setNotionToken] = useState("");
  const [notionError, setNotionError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [githubError, setGithubError] = useState<string | null>(null);

  const { data: integrations, isLoading } = useQuery<IntegrationsStatus>({
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
    mutationFn: async (provider: "google-drive" | "notion" | "github") => {
      return await apiClient(`/api/integrations/${provider}`, { method: "DELETE" });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["connected-integrations"] });
    },
  });

  const handleConnectGoogleDrive = async () => {
    setGoogleError(null);
    try {
      const res = await apiClient<{ url: string }>(
        "/api/integrations/google-drive/auth-url",
      );
      if (res.url) window.location.href = res.url;
    } catch (err: unknown) {
      setGoogleError(
        err instanceof Error ? err.message : "Failed to get Google Drive auth URL.",
      );
    }
  };

  const handleConnectGithub = async () => {
    setGithubError(null);
    try {
      const res = await apiClient<{ url: string }>(
        "/api/integrations/github/auth-url",
      );
      if (res.url) window.location.href = res.url;
    } catch (err: unknown) {
      setGithubError(
        err instanceof Error ? err.message : "Failed to get GitHub auth URL.",
      );
    }
  };

  const accountBoxClass =
    "rounded-xl border border-border bg-muted/30 px-3 py-2.5 text-xs space-y-0.5";

  const cards = isLoading ? (
    <div className="flex justify-center py-16">
      <ThemeLoader size={28} />
    </div>
  ) : (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-3 lg:items-stretch">
      <IntegrationCard
        title="Google Drive"
        description="Import Google Docs and PDFs from Drive into any notebook."
        connected={!!integrations?.googleDrive?.connected}
        icon={<GoogleDriveIcon size={34} />}
        iconClassName="bg-muted/30"
        footer={
          integrations?.googleDrive?.connected ? (
            <button
              type="button"
              onClick={() => disconnectMutation.mutate("google-drive")}
              disabled={disconnectMutation.isPending}
              className={actionBtnDanger}
            >
              <Trash2 className="size-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectGoogleDrive}
              className={actionBtnPrimary}
            >
              Connect Google Drive
              <ExternalLink className="size-3.5" />
            </button>
          )
        }
      >
        {googleError && (
          <div className="p-2.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
            {googleError}
          </div>
        )}
        {integrations?.googleDrive?.connected ? (
          <div className={accountBoxClass}>
            <p className="font-medium text-foreground truncate">
              {integrations.googleDrive.account?.metadata?.name || "Google Account"}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              {integrations.googleDrive.account?.metadata?.email}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Sign in with Google to browse Docs and PDFs when adding sources.
          </p>
        )}
      </IntegrationCard>

      <IntegrationCard
        title="Notion"
        description="Import pages and sync study artifacts with your workspace."
        connected={!!integrations?.notion?.connected}
        icon={<NotionIcon size={24} />}
        iconClassName="bg-muted/30"
        footer={
          integrations?.notion?.connected ? (
            <button
              type="button"
              onClick={() => disconnectMutation.mutate("notion")}
              disabled={disconnectMutation.isPending}
              className={actionBtnDanger}
            >
              <Trash2 className="size-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={() => connectNotionMutation.mutate(notionToken)}
              disabled={connectNotionMutation.isPending || !notionToken.trim()}
              className={actionBtnPrimary}
            >
              {connectNotionMutation.isPending ? (
                <ThemeLoader size={14} />
              ) : (
                "Connect Notion"
              )}
            </button>
          )
        }
      >
        {notionError && (
          <div className="p-2.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
            {notionError}
          </div>
        )}
        {integrations?.notion?.connected ? (
          <div className={accountBoxClass}>
            <p className="font-medium text-foreground truncate">
              {integrations.notion.account?.metadata?.workspaceName ||
                "Connected workspace"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Import & export enabled
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label
              htmlFor="notion-integration-token"
              className="block text-[11px] font-medium text-muted-foreground"
            >
              Integration secret
            </label>
            <input
              id="notion-integration-token"
              type="password"
              placeholder="secret_…"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="text-[10px] text-muted-foreground">
              Create at{" "}
              <a
                href="https://www.notion.so/my-integrations"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                notion.so/my-integrations
              </a>
            </p>
          </div>
        )}
      </IntegrationCard>

      <IntegrationCard
        title="GitHub"
        description="Import public or private repos as grounded chat sources."
        connected={!!integrations?.github?.connected}
        icon={<GithubIcon size={22} />}
        footer={
          integrations?.github?.connected ? (
            <button
              type="button"
              onClick={() => disconnectMutation.mutate("github")}
              disabled={disconnectMutation.isPending}
              className={actionBtnDanger}
            >
              <Trash2 className="size-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnectGithub}
              className={actionBtnPrimary}
            >
              Connect GitHub
              <ExternalLink className="size-3.5" />
            </button>
          )
        }
      >
        {githubError && (
          <div className="p-2.5 text-xs bg-destructive/10 text-destructive border border-destructive/20 rounded-xl">
            {githubError}
          </div>
        )}
        {integrations?.github?.connected ? (
          <div className={accountBoxClass}>
            <p className="font-medium text-foreground truncate">
              {integrations.github.account?.metadata?.name || "GitHub account"}
            </p>
            <p className="text-[11px] text-muted-foreground font-mono truncate">
              @{integrations.github.account?.metadata?.login}
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            OAuth connects your account to index READMEs, docs, and code.
          </p>
        )}
      </IntegrationCard>
    </div>
  );

  const body = (
    <div className="flex-1 max-w-6xl mx-auto w-full min-w-0 p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8 select-none">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2">
          <Puzzle className="w-5 h-5 text-foreground shrink-0" />
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Cloud Integrations
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
          Connect cloud storage and workspace tools to ingest documents directly.
        </p>
      </div>
      {cards}
    </div>
  );

  if (workspaceId) {
    return body;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border px-4 sm:px-6 py-3.5 flex items-center justify-between bg-card">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Integrations
        </span>
      </div>
      {body}
    </div>
  );
}
