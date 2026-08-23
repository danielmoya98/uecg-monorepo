-- AlterTable
ALTER TABLE "class_periods" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "class_periods" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "class_periods" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "class_periods_shift_order_key" ON "class_periods"("shift", "order");
CREATE INDEX IF NOT EXISTS "class_periods_shift_is_active_order_idx" ON "class_periods"("shift", "is_active", "order");
