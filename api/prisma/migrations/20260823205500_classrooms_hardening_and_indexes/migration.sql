-- CreateIndex
CREATE INDEX IF NOT EXISTS "classrooms_advisor_id_idx" ON "classrooms"("advisor_id");
CREATE INDEX IF NOT EXISTS "classrooms_base_room_id_idx" ON "classrooms"("base_room_id");
