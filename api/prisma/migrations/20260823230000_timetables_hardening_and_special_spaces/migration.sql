-- AlterTable
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "requires_special_space" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "subjects" ADD COLUMN IF NOT EXISTS "allowed_space_type" "SpaceType";
