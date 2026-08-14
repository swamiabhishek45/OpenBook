export type SourceType = "PDF" | "WEBSITE" | "YOUTUBE" | "TEXT" | "MARKDOWN";

export type SourceStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface SourceChunk {
  id: string;
  sourceId: string;
  index: number;
  content: string;
  tokenCount?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Source {
  id: string;
  workspaceId: string;
  type: SourceType;
  title: string;
  content: string | null;
  url: string | null;
  status: SourceStatus;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
  chunks?: SourceChunk[];
  _count?: {
    chunks: number;
  };
}
