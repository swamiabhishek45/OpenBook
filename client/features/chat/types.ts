export interface Citation {
  sourceId?: string;
  sourceTitle?: string;
  sourceType?: string;
  chunkId?: string;
  chunkIndex?: number;
  page?: number;
  excerpt?: string;
  score?: number;
  url?: string;
}

export interface ChatMessage {
  id: string;
  conversationId?: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: Citation[] | null;
  createdAt?: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  title: string | null;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: ChatMessage[];
}
