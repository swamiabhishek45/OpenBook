-- SourceType values added after initial sources migration
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'GOOGLE_DOC';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'NOTION_PAGE';
ALTER TYPE "SourceType" ADD VALUE IF NOT EXISTS 'GITHUB_REPO';

-- IntegrationProvider was never captured in a prior migration; create it if missing.
DO $$ BEGIN
    CREATE TYPE "IntegrationProvider" AS ENUM ('GOOGLE_DRIVE', 'NOTION', 'GITHUB');
EXCEPTION
    WHEN duplicate_object THEN
        ALTER TYPE "IntegrationProvider" ADD VALUE IF NOT EXISTS 'GITHUB';
END $$;

-- connected_account table (also missing from migration history)
CREATE TABLE IF NOT EXISTS "connected_account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "IntegrationProvider" NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "connected_account_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "connected_account_userId_provider_key"
    ON "connected_account"("userId", "provider");

CREATE INDEX IF NOT EXISTS "connected_account_userId_idx"
    ON "connected_account"("userId");

DO $$ BEGIN
    ALTER TABLE "connected_account"
        ADD CONSTRAINT "connected_account_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
