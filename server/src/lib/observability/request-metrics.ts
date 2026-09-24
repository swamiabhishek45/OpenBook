export type RequestStage =
    | "embed_query"
    | "pinecone_query"
    | "rerank"
    | "mem0"
    | "tavily"
    | "llm_stream"
    | "total";

export type RequestMetricsSnapshot = {
    stagesMs: Partial<Record<RequestStage, number>>;
    embedTokens?: number;
    llmPromptTokens?: number;
    llmCompletionTokens?: number;
    rerankCalls?: number;
    embedCacheHit?: boolean;
};

export function createRequestMetrics() {
    const stagesMs: Partial<Record<RequestStage, number>> = {};
    const startedAt = performance.now();

    let embedTokens: number | undefined;
    let llmPromptTokens: number | undefined;
    let llmCompletionTokens: number | undefined;
    let rerankCalls: number | undefined;
    let embedCacheHit: boolean | undefined;

    return {
        setStage(stage: RequestStage, ms: number) {
            stagesMs[stage] = ms;
        },
        setEmbedTokens(tokens: number) {
            embedTokens = tokens;
        },
        setLlmUsage(input: {
            promptTokens?: number;
            completionTokens?: number;
        }) {
            llmPromptTokens = input.promptTokens;
            llmCompletionTokens = input.completionTokens;
        },
        setRerankCalls(count: number) {
            rerankCalls = count;
        },
        setEmbedCacheHit(hit: boolean) {
            embedCacheHit = hit;
        },
        finish(): RequestMetricsSnapshot {
            stagesMs.total = Math.round(performance.now() - startedAt);
            return {
                stagesMs,
                embedTokens,
                llmPromptTokens,
                llmCompletionTokens,
                rerankCalls,
                embedCacheHit,
            };
        },
    };
}
