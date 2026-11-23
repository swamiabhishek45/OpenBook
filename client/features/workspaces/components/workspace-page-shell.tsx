import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pillClassName } from "@/components/ui/pill";
import { cn } from "@/lib/utils";

type WorkspacePageShellProps = {
  workspaceId: string;
  sectionLabel: string;
  children: ReactNode;
};

export function WorkspacePageShell({
  workspaceId,
  sectionLabel,
  children,
}: WorkspacePageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="shrink-0 px-3 pt-3 pb-2 sm:px-4">
        <div className="flex h-[52px] items-center justify-between gap-2 rounded-full bg-muted/70 py-1.5 pr-4 pl-1.5 backdrop-blur-xl dark:bg-muted/60">
          <Link
            href={`/workspace/${workspaceId}`}
            className={cn(
              pillClassName({ variant: "card", size: "sm" }),
              "min-w-0 pr-4 pl-3",
            )}
          >
            <ArrowLeft className="size-4 shrink-0" />
            <span className="truncate">
              <span className="sm:hidden">Back</span>
              <span className="hidden sm:inline">Back to notebook</span>
            </span>
          </Link>

          <span className="max-w-[45%] truncate text-right text-[13px] font-semibold tracking-[-0.01em] text-foreground">
            {sectionLabel}
          </span>
        </div>
      </div>

      <div className="flex-1">{children}</div>
    </div>
  );
}
