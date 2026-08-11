-- CreateEnum
CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');

-- CreateEnum
CREATE TYPE "ArtifactType" AS ENUM ('SUMMARY', 'TAKEAWAYS', 'FLASHCARDS', 'QUIZ', 'MINDMAP', 'REPORT');

-- CreateEnum
CREATE TYPE "ArtifactStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');

-- CreateTable
CREATE TABLE "conversation" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "title" TEXT,
    "summary" TEXT,
    "summaryMessageCount" INTEGER NOT NULL DEFAULT 0,
    "summarizedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" "MessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "citations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_artifact" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "type" "ArtifactType" NOT NULL,
    "title" TEXT NOT NULL,
    "content" JSONB,
    "sourceIds" TEXT[],
    "status" "ArtifactStatus" NOT NULL DEFAULT 'PENDING',
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learning_artifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversation_workspaceId_idx" ON "conversation"("workspaceId");

-- CreateIndex
CREATE INDEX "conversation_workspaceId_updatedAt_idx" ON "conversation"("workspaceId", "updatedAt");

-- CreateIndex
CREATE INDEX "message_conversationId_idx" ON "message"("conversationId");

-- CreateIndex
CREATE INDEX "message_conversationId_createdAt_idx" ON "message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_idx" ON "learning_artifact"("workspaceId");

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_type_idx" ON "learning_artifact"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "learning_artifact_workspaceId_status_idx" ON "learning_artifact"("workspaceId", "status");

-- AddForeignKey
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "learning_artifact" ADD CONSTRAINT "learning_artifact_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
