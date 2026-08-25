-- Drop problematic unique index
DROP INDEX IF EXISTS "data_update_requests_enrollment_id_status_key";

-- AlterTable data_update_requests
ALTER TABLE "data_update_requests"
  ADD COLUMN IF NOT EXISTS "previous_snapshot" JSONB,
  ADD COLUMN IF NOT EXISTS "reviewed_by_id" TEXT,
  ADD COLUMN IF NOT EXISTS "ip_address" TEXT,
  ADD COLUMN IF NOT EXISTS "user_agent" TEXT;

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'data_update_requests_reviewed_by_id_fkey'
  ) THEN
    ALTER TABLE "data_update_requests"
      ADD CONSTRAINT "data_update_requests_reviewed_by_id_fkey"
      FOREIGN KEY ("reviewed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "data_update_requests_enrollment_id_status_idx" ON "data_update_requests"("enrollment_id", "status");
CREATE INDEX IF NOT EXISTS "data_update_requests_status_created_at_idx" ON "data_update_requests"("status", "created_at");
