import { createLazyFileRoute } from "@tanstack/react-router";
import { AuditPage } from "@/features/audit";

export const Route = createLazyFileRoute("/_authenticated/audit")({
  component: AuditPage,
});
