-- CreateTable
CREATE TABLE "message_metrics" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "embedTokens" INTEGER,
    "llmPromptTokens" INTEGER,
    "llmCompletionTokens" INTEGER,
    "rerankCalls" INTEGER DEFAULT 0,
    "embedCacheHit" BOOLEAN,
    "stagesMs" JSONB,
    "estimatedCostUsd" DECIMAL(10,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "query_embedding_cache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "query_embedding_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "message_metrics_messageId_key" ON "message_metrics"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "query_embedding_cache_cacheKey_key" ON "query_embedding_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "query_embedding_cache_expiresAt_idx" ON "query_embedding_cache"("expiresAt");

-- AddForeignKey
ALTER TABLE "message_metrics" ADD CONSTRAINT "message_metrics_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
