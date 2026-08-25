-- CreateEnum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JustificationStatus') THEN
    CREATE TYPE "JustificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

-- CreateTable attendance_justifications
CREATE TABLE IF NOT EXISTS "attendance_justifications" (
    "id" TEXT NOT NULL,
    "enrollment_id" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "reason" TEXT NOT NULL,
    "document_url" TEXT,
    "status" "JustificationStatus" NOT NULL DEFAULT 'APPROVED',
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_justifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable holidays
CREATE TABLE IF NOT EXISTS "holidays" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "academic_year_id" TEXT,
    "is_recurring" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey attendance_justifications -> Enrollment
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_justifications_enrollment_id_fkey'
  ) THEN
    ALTER TABLE "attendance_justifications"
      ADD CONSTRAINT "attendance_justifications_enrollment_id_fkey"
      FOREIGN KEY ("enrollment_id") REFERENCES "Enrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey attendance_justifications -> users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'attendance_justifications_approved_by_id_fkey'
  ) THEN
    ALTER TABLE "attendance_justifications"
      ADD CONSTRAINT "attendance_justifications_approved_by_id_fkey"
      FOREIGN KEY ("approved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

-- AddForeignKey holidays -> academic_years
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'holidays_academic_year_id_fkey'
  ) THEN
    ALTER TABLE "holidays"
      ADD CONSTRAINT "holidays_academic_year_id_fkey"
      FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

-- CreateIndex attendance_records
CREATE INDEX IF NOT EXISTS "attendance_records_date_status_idx" ON "attendance_records"("date", "status");

-- CreateIndex attendance_justifications
CREATE INDEX IF NOT EXISTS "attendance_justifications_enrollment_id_start_date_end_date_idx" ON "attendance_justifications"("enrollment_id", "start_date", "end_date");
CREATE INDEX IF NOT EXISTS "attendance_justifications_status_start_date_idx" ON "attendance_justifications"("status", "start_date");

-- CreateIndex holidays
CREATE UNIQUE INDEX IF NOT EXISTS "holidays_date_academic_year_id_key" ON "holidays"("date", "academic_year_id");
CREATE INDEX IF NOT EXISTS "holidays_date_idx" ON "holidays"("date");
