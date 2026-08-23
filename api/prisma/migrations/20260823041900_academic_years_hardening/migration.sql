-- AlterTable
ALTER TABLE "academic_years" ALTER COLUMN "start_date" SET DATA TYPE DATE;
ALTER TABLE "academic_years" ALTER COLUMN "end_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "trimesters" ALTER COLUMN "start_date" SET DATA TYPE DATE;
ALTER TABLE "trimesters" ALTER COLUMN "end_date" SET DATA TYPE DATE;

-- DropForeignKey
ALTER TABLE "trimesters" DROP CONSTRAINT IF EXISTS "trimesters_academic_year_id_fkey";

-- AddForeignKey
ALTER TABLE "trimesters" ADD CONSTRAINT "trimesters_academic_year_id_fkey" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_academic_year" ON "academic_years"("status") WHERE "status" = 'ACTIVE';
