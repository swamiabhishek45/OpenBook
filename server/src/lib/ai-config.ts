/** Default chat model when the client or workspace does not specify one. */
export const CHAT_MODEL = "gpt-4o-mini";

/** Allowed chat models exposed to the client and workspace settings. */
export const CHAT_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

/** OpenAI embedding model used for RAG vector indexing and query embedding. */
export const EMBEDDING_MODEL = "text-embedding-3-small";

/** Vector dimension count — must match Pinecone index configuration (default: 512 for chaibooklm index). */
export const EMBEDDING_DIMENSIONS = Number(process.env.EMBEDDING_DIMENSIONS) || 512;

/** Target max characters per text chunk during source processing. */
export const CHUNK_SIZE = 1000;

/** Character overlap between consecutive chunks at split boundaries. */
export const CHUNK_OVERLAP = 100;

/** Number of Pinecone candidates to fetch before reranking. */
export const RAG_RETRIEVE_K = Number(process.env.RAG_RETRIEVE_K) || 20;

/** Number of chunks included in chat context after rerank. */
export const RAG_TOP_K = Number(process.env.RAG_TOP_K) || 6;

/** Minimum similarity / rerank score for a retrieved chunk to be included in context. */
export const RAG_MIN_SCORE = Number(process.env.RAG_MIN_SCORE) || 0.20;

/** When true, rerank Pinecone candidates before building context. */
export const RERANK_ENABLED =
    process.env.RERANK_ENABLED !== "false" && process.env.RERANK_ENABLED !== "0";

/** Rerank model identifier (Cohere API). */
export const RERANK_MODEL =
    process.env.RERANK_MODEL?.trim() || "rerank-v3.5";

/** TTL for cached query embeddings (seconds). */
export const QUERY_EMBED_CACHE_TTL_SEC =
    Number(process.env.QUERY_EMBED_CACHE_TTL_SEC) || 86400;

/** If the model cites nothing, persist top-N retrieved chunks as citations. */
export const CITATION_FALLBACK_TOP_N =
    Number(process.env.CITATION_FALLBACK_TOP_N) || 1;

/** Enqueue a conversation summary job every N persisted messages. */
export const CONVERSATION_SUMMARY_INTERVAL = 8;

/** Max recent UI messages sent to the model when a rolling summary exists. */
export const RECENT_MESSAGE_WINDOW = 12;