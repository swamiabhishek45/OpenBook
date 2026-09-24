-- Billing / usage fields (idempotent for DBs baselined from older migration names)

DO $$ BEGIN
    CREATE TYPE "PlanType" AS ENUM ('FREE', 'PRO', 'PRO_PLUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "plan" "PlanType" NOT NULL DEFAULT 'FREE';
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP(3);
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "totalArtifactsCreated" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "payment_record" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "PlanType" NOT NULL DEFAULT 'PRO',
    "razorpayOrderId" TEXT NOT NULL,
    "razorpayPaymentId" TEXT,
    "razorpaySignature" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_record_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "payment_record_razorpayOrderId_key"
    ON "payment_record"("razorpayOrderId");

CREATE UNIQUE INDEX IF NOT EXISTS "payment_record_razorpayPaymentId_key"
    ON "payment_record"("razorpayPaymentId");

CREATE INDEX IF NOT EXISTS "payment_record_userId_idx"
    ON "payment_record"("userId");

DO $$ BEGIN
    ALTER TABLE "payment_record"
        ADD CONSTRAINT "payment_record_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
