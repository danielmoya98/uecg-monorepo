import { useEffect } from "react";
import { useRouteContext } from "@tanstack/react-router";
import { toast } from "sonner";

export const useRudeProtection = () => {
  const context = useRouteContext({ from: "/_authenticated" });

  // Verificamos permisos a través de la API síncrona
  const canReadRude = context.can("read:all", "Student");
  const canManageRude = context.can("update:all", "Student");
  const isLoaded = true; // El router ya garantizó el cargado síncrono del contexto

  // Escudo visual de seguridad síncrona
  useEffect(() => {
    if (!canReadRude) {
      toast.error("Acceso denegado a la Bandeja RUDE");
    }
  }, [canReadRude]);

  return { isLoaded, canReadRude, canManageRude };
};
