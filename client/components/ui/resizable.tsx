"use client"

import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  direction,
  orientation = direction,
  ...props
}: ResizablePrimitive.GroupProps & {
  direction?: "horizontal" | "vertical";
  orientation?: "horizontal" | "vertical";
}) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      orientation={orientation}
      {...props}
    />
  )
}

function ResizablePanel({ ...props }: ResizablePrimitive.PanelProps) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        // A quiet gutter between the soft panels: the grip only shows on hover.
        "group relative z-10 flex w-2 shrink-0 cursor-col-resize items-center justify-center bg-transparent select-none",
        className
      )}
      {...props}
    >
      {withHandle && (
        <div className="z-10 h-10 w-1 shrink-0 rounded-full bg-border transition-colors duration-150 group-hover:bg-muted-foreground/50 group-data-[resize-handle-state=drag]:bg-muted-foreground/70" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup }
