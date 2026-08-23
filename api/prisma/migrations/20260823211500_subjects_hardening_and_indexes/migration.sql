-- AlterTable
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "code" TEXT;
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subjects_name_level_key" ON "subjects"("name", "level");
CREATE INDEX IF NOT EXISTS "subjects_level_is_active_idx" ON "subjects"("level", "is_active");
CREATE INDEX IF NOT EXISTS "subjects_area_idx" ON "subjects"("area");

-- DropForeignKey
ALTER TABLE "teacher_assignments" DROP CONSTRAINT IF EXISTS "teacher_assignments_subject_id_fkey";

-- AddForeignKey
ALTER TABLE "teacher_assignments" ADD CONSTRAINT "teacher_assignments_subject_id_fkey" FOREIGN KEY ("subject_id") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
