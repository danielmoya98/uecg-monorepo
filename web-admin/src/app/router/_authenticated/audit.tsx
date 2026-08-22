import { createFileRoute, redirect } from "@tanstack/react-router";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/audit")({
  // 🛡️ Guardia de Seguridad ABAC síncrono del enrutador centralizado
  beforeLoad: ({ context }) => {
    const canReadAudit = context.can("read:all", "Audit");

    if (!canReadAudit) {
      toast.error("Acceso denegado a la Auditoría del Sistema");
      throw redirect({ to: "/dashboard" });
    }
  },
  gcTime: 0,
});
