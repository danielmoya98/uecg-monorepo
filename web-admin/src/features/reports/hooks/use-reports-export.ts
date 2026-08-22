import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSocket } from "@/features/identity";
import { api } from "@/shared/api/client";
import { useRouteContext } from "@tanstack/react-router";

interface ExportReadyPayload {
  message: string;
  fileName: string;
}

export function useReportsExport() {
  const [isExporting, setIsExporting] = useState(false);
  const socket = useSocket();
  const { user } = useRouteContext({ from: "/_authenticated" });

  useEffect(() => {
    if (!user?.id || !socket) return;

    const eventName = `export-reports-ready-${user.id}`;
    
    // Evita duplicidad de handlers limpiando primero
    socket.off(eventName);

    const handleExportReady = (data: ExportReadyPayload) => {
      setIsExporting(false);

      toast.success("¡Lote de Libretas Ley 070 Generado!", {
        duration: Infinity,
        description: "El archivo ZIP de libretas académicas está listo para su descarga.",
        action: {
          label: "Descargar ZIP",
          onClick: async () => {
            const downloadToast = toast.loading("Descargando ZIP...", {
              description: "Obteniendo archivo comprimido del servidor...",
            });
            try {
              const response = await api.get(`/reports/export/zip/download/${data.fileName}`, {
                responseType: "blob",
              });

              const blob = new Blob([response.data], { type: "application/zip" });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.setAttribute("download", data.fileName);
              document.body.appendChild(link);
              link.click();
              link.parentNode?.removeChild(link);
              window.URL.revokeObjectURL(url);

              toast.success("Descarga completada con éxito", { id: downloadToast });
            } catch (error) {
              console.error("Error al descargar ZIP de libretas:", error);
              toast.error("Error de autorización o red al descargar el archivo", {
                id: downloadToast,
              });
            }
          },
        },
      });
    };

    socket.on(eventName, handleExportReady);

    return () => {
      socket.off(eventName, handleExportReady);
    };
  }, [user?.id, socket]);

  return {
    isExporting,
    setIsExporting,
  };
}
