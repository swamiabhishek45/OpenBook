import React from "react";
import { Star } from "lucide-react";
import { GithubIcon } from "./brand-icons";
import { GITHUB_URL } from "./links";
import { formatGithubStarCount, getGithubStarCount } from "./github-stars";
import { pillClassName } from "./primitives";

interface GithubStarButtonProps {
  className?: string;
  size?: "md" | "lg";
}

export async function GithubStarButton({ className, size = "lg" }: GithubStarButtonProps) {
  const starCount = await getGithubStarCount();

  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noreferrer noopener"
      className={pillClassName({ variant: "chip", size, className })}
    >
      <GithubIcon className="size-4.25" />
      <span>Star on GitHub</span>
      {starCount !== null && (
        <span className="inline-flex items-center gap-1 rounded-full bg-background/70 px-2 py-0.5 font-mono text-xs text-muted-foreground">
          <Star className="size-3 fill-current" />
          {formatGithubStarCount(starCount)}
        </span>
      )}
    </a>
  );
}
