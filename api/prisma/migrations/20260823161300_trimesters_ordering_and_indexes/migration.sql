-- AlterTable
ALTER TABLE "trimesters" ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "trimesters" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "trimesters" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Data update: Backfill order by trimester name
UPDATE "trimesters" SET "order" = 1 WHERE "name"::text = 'PRIMER_TRIMESTRE';
UPDATE "trimesters" SET "order" = 2 WHERE "name"::text = 'SEGUNDO_TRIMESTRE';
UPDATE "trimesters" SET "order" = 3 WHERE "name"::text = 'TERCER_TRIMESTRE';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "trimesters_academic_year_id_order_key" ON "trimesters"("academic_year_id", "order");
CREATE INDEX IF NOT EXISTS "trimesters_academic_year_id_is_open_idx" ON "trimesters"("academic_year_id", "is_open");
