"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

interface MindmapViewerProps {
  content: any;
}

export function MindmapViewer({ content }: MindmapViewerProps) {
  const { nodes, edges } = useMemo(() => {
    let parsed: any = content;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = { root: "Workspace Knowledge", branches: content.split("\n").filter(Boolean).slice(0, 8) };
      }
    }

    const n: Node[] = [];
    const e: Edge[] = [];

    const rootLabel = parsed.root || parsed.title || "Core Topic";
    n.push({
      id: "root",
      type: "default",
      position: { x: 250, y: 50 },
      data: { label: rootLabel },
      style: {
        background: "var(--foreground)",
        color: "var(--background)",
        border: "1px solid var(--border)",
        borderRadius: "12px",
        fontWeight: "600",
        padding: "10px 16px",
        fontSize: "13px",
      },
    });

    const branches = Array.isArray(parsed.branches)
      ? parsed.branches
      : Array.isArray(parsed.nodes)
      ? parsed.nodes
      : [
          "Key Concepts & Foundations",
          "Methodology & Applications",
          "Key Findings & Results",
          "Summary & Future Scope",
        ];

    branches.forEach((branch: any, idx: number) => {
      const branchId = `branch-${idx}`;
      const branchLabel = typeof branch === "string" ? branch : branch.title || branch.label || `Node ${idx + 1}`;
      const angle = (idx / branches.length) * Math.PI * 2;
      const radius = 220;

      const x = 250 + Math.cos(angle) * radius;
      const y = 200 + Math.sin(angle) * radius;

      n.push({
        id: branchId,
        position: { x, y },
        data: { label: branchLabel },
        style: {
          background: "var(--card)",
          color: "var(--foreground)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "12px",
          maxWidth: "180px",
        },
      });

      e.push({
        id: `e-root-${branchId}`,
        source: "root",
        target: branchId,
        animated: true,
        style: { stroke: "var(--muted-foreground)" },
      });
    });

    return { nodes: n, edges: e };
  }, [content]);

  return (
    <div className="w-full h-[520px] rounded-2xl border border-border bg-card/60 overflow-hidden relative select-none">
      <ReactFlow nodes={nodes} edges={edges} fitView>
        <Background gap={16} size={1} />
        <Controls className="bg-card border-border text-foreground" />
        <MiniMap
          nodeStrokeWidth={3}
          zoomable
          pannable
          className="bg-card/90 border border-border rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
