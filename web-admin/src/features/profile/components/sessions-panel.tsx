import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Laptop, Smartphone, Shield, LogOut, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ProfileService, type UserSessionItem } from "../api/profile.service";

export function SessionsPanel() {
  const queryClient = useQueryClient();

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ["user-sessions"],
    queryFn: ProfileService.getSessions,
  });

  const revokeMutation = useMutation({
    mutationFn: (sessionId: string) => ProfileService.revokeSession(sessionId),
    onSuccess: () => {
      toast.success("Sesión revocada exitosamente");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: () => {
      toast.error("Error al revocar la sesión");
    },
  });

  const revokeOthersMutation = useMutation({
    mutationFn: ProfileService.revokeOtherSessions,
    onSuccess: () => {
      toast.success("Todas las demás sesiones han sido cerradas");
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
    onError: () => {
      toast.error("Error al cerrar otras sesiones");
    },
  });

  const formatDeviceName = (session: UserSessionItem) => {
    if (session.deviceName) return session.deviceName;
    if (session.deviceType === "WEB") return "Navegador Web";
    if (session.deviceType.startsWith("MOBILE")) return "Aplicación Móvil";
    return "Dispositivo Conectado";
  };

  const isMobile = (type: string) => type.startsWith("MOBILE");

  return (
    <section className="bg-white border border-uecg-line p-6 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-uecg-line pb-3">
        <h2 className="text-[11px] font-black uppercase tracking-widest text-uecg-blue flex items-center gap-2">
          <Shield className="w-3.5 h-3.5" /> Dispositivos y Sesiones Activas
        </h2>
        {sessions.length > 1 && (
          <button
            onClick={() => revokeOthersMutation.mutate()}
            disabled={revokeOthersMutation.isPending}
            className="text-[9px] font-bold uppercase tracking-wider text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 disabled:opacity-50 cursor-pointer"
          >
            {revokeOthersMutation.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <LogOut className="w-3 h-3" />
            )}
            Cerrar otras sesiones
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="py-6 flex items-center justify-center text-xs text-uecg-gray gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-uecg-blue" />
          <span>Cargando sesiones...</span>
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-xs text-uecg-gray py-4 text-center">
          No hay sesiones activas registradas.
        </p>
      ) : (
        <div className="flex flex-col divide-y divide-uecg-line">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="py-3 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 border border-uecg-line text-uecg-dark shrink-0">
                  {isMobile(session.deviceType) ? (
                    <Smartphone className="w-4 h-4" />
                  ) : (
                    <Laptop className="w-4 h-4" />
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-uecg-dark uppercase text-[11px]">
                      {formatDeviceName(session)}
                    </span>
                    {session.isCurrent && (
                      <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 tracking-wider border border-emerald-300">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Este Equipo
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-uecg-gray font-mono">
                    IP: {session.ipAddress || "Local"} • {new Date(session.lastActiveAt).toLocaleString("es-BO")}
                  </span>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => revokeMutation.mutate(session.id)}
                  disabled={revokeMutation.isPending}
                  title="Cerrar sesión en este dispositivo"
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors border border-transparent hover:border-red-200 cursor-pointer disabled:opacity-50"
                  aria-label="Cerrar sesión en este dispositivo"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
