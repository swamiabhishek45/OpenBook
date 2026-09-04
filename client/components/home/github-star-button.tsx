import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "./links";
import { formatGithubStarCount, getGithubStarCount } from "./github-stars";

interface GithubStarButtonProps {
  className?: string;
}

export async function GithubStarButton({ className }: GithubStarButtonProps) {
  const starCount = await getGithubStarCount();

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer noopener"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent",
        className,
      )}
    >
      <GithubIcon />
      <span>Star on GitHub</span>
      {starCount !== null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
          <Star className="size-3 fill-current" />
          {formatGithubStarCount(starCount)}
        </span>
      )}
    </a>
  );
}
