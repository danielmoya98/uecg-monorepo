-- CreateIndex
CREATE INDEX IF NOT EXISTS "teacher_assignments_teacher_id_idx" ON "teacher_assignments"("teacher_id");

-- DropForeignKey
ALTER TABLE "grades" DROP CONSTRAINT IF EXISTS "grades_teacher_assignment_id_fkey";

-- AddForeignKey
ALTER TABLE "grades" ADD CONSTRAINT "grades_teacher_assignment_id_fkey" FOREIGN KEY ("teacher_assignment_id") REFERENCES "teacher_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
