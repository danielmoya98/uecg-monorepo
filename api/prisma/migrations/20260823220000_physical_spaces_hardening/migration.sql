-- AlterTable: Add structural fields to physical_spaces
ALTER TABLE "physical_spaces" ADD COLUMN IF NOT EXISTS "capacity" INTEGER;
ALTER TABLE "physical_spaces" ADD COLUMN IF NOT EXISTS "building" TEXT;
ALTER TABLE "physical_spaces" ADD COLUMN IF NOT EXISTS "floor" TEXT;
ALTER TABLE "physical_spaces" ADD COLUMN IF NOT EXISTS "description" TEXT;

-- CreateIndex: Search & Filter optimization for physical_spaces
CREATE INDEX IF NOT EXISTS "physical_spaces_type_isActive_idx" ON "physical_spaces"("type", "isActive");
CREATE INDEX IF NOT EXISTS "physical_spaces_name_idx" ON "physical_spaces"("name");

-- CreateIndex: Collision prevention and foreign index on schedule_slots
CREATE UNIQUE INDEX IF NOT EXISTS "schedule_slots_physical_space_id_dayOfWeek_class_period_id_key" ON "schedule_slots"("physical_space_id", "dayOfWeek", "class_period_id");
CREATE INDEX IF NOT EXISTS "schedule_slots_physical_space_id_idx" ON "schedule_slots"("physical_space_id");
