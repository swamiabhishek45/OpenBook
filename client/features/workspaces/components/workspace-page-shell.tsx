import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-border px-3 sm:px-6 py-3 sm:py-3.5 flex items-center justify-between gap-2 bg-card shrink-0">
        <Link
          href={`/workspace/${workspaceId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors min-w-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span className="truncate">
            <span className="sm:hidden">Back</span>
            <span className="hidden sm:inline">Back to Workspace Chat</span>
          </span>
        </Link>
        <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0 text-right max-w-[40%] truncate">
          {sectionLabel}
        </span>
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
