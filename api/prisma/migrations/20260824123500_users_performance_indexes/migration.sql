-- CreateIndex
CREATE INDEX "users_status_role_id_idx" ON "users"("status", "role_id");

-- CreateIndex
CREATE INDEX "users_institution_id_status_idx" ON "users"("institution_id", "status");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at" DESC);
