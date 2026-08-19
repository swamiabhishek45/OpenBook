"use client";

import React, { useState, useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface MindmapViewerProps {
  content: unknown;
}

interface RawNode {
  id: string | number;
  label?: string;
  title?: string;
}

interface RawEdge {
  id?: string;
  source: string | number;
  target: string | number;
}

interface RawGraph {
  nodes?: RawNode[];
  edges?: RawEdge[];
  root?: string;
  title?: string;
}

interface MindmapNodeData extends Record<string, unknown> {
  label: string;
  level: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggle: (id: string) => void;
  id: string;
}

// Custom interactive Node Component
function CustomMindmapNode({ data }: NodeProps) {
  const { label, level, hasChildren, isCollapsed, onToggle, id } = data as unknown as MindmapNodeData;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      onToggle(id);
    }
  };

  // Color scheme based on hierarchy level matching clean black & white theme
  const getNodeStyles = () => {
    if (level === 0) {
      // Root Node (Solid black in light mode / solid white in dark mode)
      return "bg-foreground text-background border-border shadow-md text-xs font-semibold px-4 py-2.5 rounded-xl";
    }
    if (level === 1) {
      // Category Nodes (Card background with crisp border)
      return "bg-card text-foreground border-border hover:border-zinc-400 dark:hover:border-zinc-600 shadow-xs text-xs font-medium px-3.5 py-2 rounded-lg";
    }
    // Sub-branch Nodes (Subtle muted background)
    return "bg-muted/70 text-foreground border-border hover:border-zinc-400 dark:hover:border-zinc-600 text-[11px] font-normal px-3 py-1.5 rounded-lg";
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-center gap-2 border transition-all duration-200 select-none cursor-pointer hover:scale-[1.02] max-w-55",
        getNodeStyles()
      )}
    >
      {/* Target handle on left */}
      {level > 0 && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-2! h-2! bg-muted-foreground! border-none!"
        />
      )}

      {/* Node Text Label */}
      <span className="leading-snug wrap-break-word text-left flex-1">
        {label}
      </span>

      {/* Collapse/Expand Toggle Indicator for parent nodes */}
      {hasChildren && (
        <button
          type="button"
          onClick={handleClick}
          title={isCollapsed ? "Expand branch" : "Collapse branch"}
          className={cn(
            "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-transform active:scale-90",
            level === 0
              ? "bg-background/20 hover:bg-background/40 text-background border-background/30"
              : "bg-muted hover:bg-muted/80 text-foreground border-border"
          )}
        >
          {isCollapsed ? (
            <ChevronRight className="w-2.5 h-2.5 stroke-[2.5]" />
          ) : (
            <ChevronLeft className="w-2.5 h-2.5 stroke-[2.5]" />
          )}
        </button>
      )}

      {/* Source handle on right */}
      {hasChildren && !isCollapsed && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-2! h-2! bg-muted-foreground! border-none!"
        />
      )}
    </div>
  );
}

const nodeTypes = {
  mindmapNode: CustomMindmapNode,
};

function isRawGraph(value: unknown): value is RawGraph {
  return typeof value === "object" && value !== null;
}

export function MindmapViewer({ content }: MindmapViewerProps) {
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  const toggleNode = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Parse raw content into clean node graph
  const rawGraph = useMemo(() => {
    let parsed: unknown = content;
    if (typeof content === "string") {
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {
          nodes: [
            { id: "1", label: content.slice(0, 40) || "Central Subject" },
            { id: "2", label: "Core Principles" },
            { id: "3", label: "Key Applications" },
          ],
          edges: [
            { id: "e1-2", source: "1", target: "2" },
            { id: "e1-3", source: "1", target: "3" },
          ],
        };
      }
    }

    let rawNodes: RawNode[] = [];
    let rawEdges: RawEdge[] = [];

    if (isRawGraph(parsed)) {
      if (Array.isArray(parsed.nodes)) {
        rawNodes = parsed.nodes;
      } else if (Array.isArray(parsed)) {
        rawNodes = parsed;
      }

      if (Array.isArray(parsed.edges)) {
        rawEdges = parsed.edges;
      }
    }

    const fallbackTitle = isRawGraph(parsed) ? parsed.root ?? parsed.title : undefined;

    if (rawNodes.length === 0) {
      rawNodes = [
        { id: "1", label: fallbackTitle || "Central Subject" },
        { id: "2", label: "Key Concepts" },
        { id: "3", label: "Implementations" },
      ];
      rawEdges = [
        { id: "e1-2", source: "1", target: "2" },
        { id: "e1-3", source: "1", target: "3" },
      ];
    }

    const nodeIds = new Set(rawNodes.map((n) => String(n.id)));
    const validEdges = rawEdges.filter(
      (e) => nodeIds.has(String(e.source)) && nodeIds.has(String(e.target))
    );

    // Build adjacency list & calculate in-degrees
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};

    rawNodes.forEach((n) => {
      const id = String(n.id);
      adj[id] = [];
      inDegree[id] = 0;
    });

    validEdges.forEach((e) => {
      const src = String(e.source);
      const tgt = String(e.target);
      adj[src]?.push(tgt);
      inDegree[tgt] = (inDegree[tgt] || 0) + 1;
    });

    // Root node has 0 in-degree or is the first node
    let rootId = String(rawNodes[0]?.id);
    const roots = rawNodes.filter((n) => inDegree[String(n.id)] === 0);
    if (roots.length > 0) {
      rootId = String(roots[0].id);
    }

    return { rawNodes, validEdges, adj, inDegree, rootId };
  }, [content]);

  // Compute visible layout dynamically based on collapsedIds
  const { nodes, edges } = useMemo(() => {
    const { rawNodes, adj, inDegree, rootId } = rawGraph;

    // Node labels dictionary
    const labelMap: Record<string, string> = {};
    rawNodes.forEach((n) => {
      labelMap[String(n.id)] = n.label || n.title || `Node ${n.id}`;
    });

    // Determine visible nodes and compute hierarchy levels
    const visibleNodeIds = new Set<string>();
    const levels: Record<string, number> = {};

    function traverse(nodeId: string, level: number) {
      visibleNodeIds.add(nodeId);
      levels[nodeId] = level;

      if (!collapsedIds.has(nodeId)) {
        const children = adj[nodeId] || [];
        children.forEach((childId) => {
          if (!visibleNodeIds.has(childId)) {
            traverse(childId, level + 1);
          }
        });
      }
    }

    // Traverse starting from root
    traverse(rootId, 0);

    // Add any disconnected root nodes that were missed
    rawNodes.forEach((n) => {
      const id = String(n.id);
      if (inDegree[id] === 0 && !visibleNodeIds.has(id)) {
        traverse(id, 0);
      }
    });

    // Calculate vertical leaf subtree heights for beautiful tree distribution
    function getSubtreeLeafCount(nodeId: string): number {
      if (collapsedIds.has(nodeId)) return 1;
      const children = (adj[nodeId] || []).filter((c) => visibleNodeIds.has(c));
      if (children.length === 0) return 1;
      return children.reduce((acc, child) => acc + getSubtreeLeafCount(child), 0);
    }

    const positions: Record<string, { x: number; y: number }> = {};
    const HORIZONTAL_STEP = 280;
    const ROW_HEIGHT = 64;

    function layoutSubtree(nodeId: string, currentX: number, startY: number): number {
      const subtreeLeaves = getSubtreeLeafCount(nodeId);
      const totalHeight = subtreeLeaves * ROW_HEIGHT;
      const centerY = startY + totalHeight / 2;

      positions[nodeId] = { x: currentX, y: centerY };

      if (!collapsedIds.has(nodeId)) {
        const children = (adj[nodeId] || []).filter((c) => visibleNodeIds.has(c));
        let childStartY = startY;

        children.forEach((childId) => {
          const childLeaves = getSubtreeLeafCount(childId);
          layoutSubtree(childId, currentX + HORIZONTAL_STEP, childStartY);
          childStartY += childLeaves * ROW_HEIGHT;
        });
      }

      return totalHeight;
    }

    layoutSubtree(rootId, 40, 40);

    // Build visible ReactFlow Nodes
    const rfNodes: Node[] = Array.from(visibleNodeIds).map((id) => {
      const children = adj[id] || [];
      const hasChildren = children.length > 0;
      const isCollapsed = collapsedIds.has(id);
      const level = levels[id] ?? 0;
      const pos = positions[id] || { x: 40, y: 100 };

      return {
        id,
        type: "mindmapNode",
        position: pos,
        data: {
          id,
          label: labelMap[id] || `Node ${id}`,
          level,
          hasChildren,
          isCollapsed,
          onToggle: toggleNode,
        },
      };
    });

    // Build visible ReactFlow Edges with smooth curves
    const rfEdges: Edge[] = [];
    visibleNodeIds.forEach((srcId) => {
      if (!collapsedIds.has(srcId)) {
        const children = (adj[srcId] || []).filter((tgtId) => visibleNodeIds.has(tgtId));
        children.forEach((tgtId, idx) => {
          rfEdges.push({
            id: `edge-${srcId}-${tgtId}-${idx}`,
            source: srcId,
            target: tgtId,
            type: "bezier",
            animated: true,
            style: {
              stroke: "var(--muted-foreground)",
              strokeWidth: 1.5,
            },
          });
        });
      }
    });

    return { nodes: rfNodes, edges: rfEdges };
  }, [rawGraph, collapsedIds, toggleNode]);

  return (
    <div className="w-full h-140 rounded-2xl border border-border bg-card/60 text-foreground overflow-hidden relative select-none">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={1.5}
      >
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
