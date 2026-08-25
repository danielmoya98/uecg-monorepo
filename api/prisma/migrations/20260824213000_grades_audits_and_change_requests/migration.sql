-- AlterTable grade_change_requests: add proposed_recovery and rejection_reason
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'grade_change_requests' AND column_name = 'proposed_recovery'
  ) THEN
    ALTER TABLE "grade_change_requests" ADD COLUMN "proposed_recovery" INTEGER;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'grade_change_requests' AND column_name = 'rejection_reason'
  ) THEN
    ALTER TABLE "grade_change_requests" ADD COLUMN "rejection_reason" TEXT;
  END IF;
END $$;

-- CreateIndex on grade_change_requests
CREATE INDEX IF NOT EXISTS "grade_change_requests_grade_id_status_idx" ON "grade_change_requests"("grade_id", "status");
CREATE INDEX IF NOT EXISTS "grade_change_requests_requested_by_id_status_idx" ON "grade_change_requests"("requested_by_id", "status");

-- CreateTable grade_audits
CREATE TABLE IF NOT EXISTS "grade_audits" (
    "id" TEXT NOT NULL,
    "grade_id" TEXT NOT NULL,
    "changed_by_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "old_scores" JSONB,
    "new_scores" JSONB NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "grade_audits_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey grade_audits -> grades
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'grade_audits_grade_id_fkey'
  ) THEN
    ALTER TABLE "grade_audits"
      ADD CONSTRAINT "grade_audits_grade_id_fkey"
      FOREIGN KEY ("grade_id") REFERENCES "grades"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey grade_audits -> users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'grade_audits_changed_by_id_fkey'
  ) THEN
    ALTER TABLE "grade_audits"
      ADD CONSTRAINT "grade_audits_changed_by_id_fkey"
      FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex on grade_audits
CREATE INDEX IF NOT EXISTS "grade_audits_grade_id_idx" ON "grade_audits"("grade_id");
CREATE INDEX IF NOT EXISTS "grade_audits_changed_by_id_idx" ON "grade_audits"("changed_by_id");
