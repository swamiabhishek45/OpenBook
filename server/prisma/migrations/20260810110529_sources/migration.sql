-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('PDF', 'WEBSITE', 'YOUTUBE', 'TEXT', 'MARKDOWN');

-- CreateEnum
CREATE TYPE "SourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "source" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "url" TEXT,
    "status" "SourceStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_chunk" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "tokenCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "source_chunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_workspaceId_idx" ON "source"("workspaceId");

-- CreateIndex
CREATE INDEX "source_workspaceId_type_idx" ON "source"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "source_workspaceId_status_idx" ON "source"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "source_chunk_sourceId_idx" ON "source_chunk"("sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "source_chunk_sourceId_index_key" ON "source_chunk"("sourceId", "index");

-- AddForeignKey
ALTER TABLE "source" ADD CONSTRAINT "source_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_chunk" ADD CONSTRAINT "source_chunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "source"("id") ON DELETE CASCADE ON UPDATE CASCADE;
