import { Building2, Loader2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const SettingsLoading = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-in fade-in">
    <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray animate-pulse">
      Obteniendo configuración central...
    </span>
  </div>
);

export const SettingsHeader = () => (
  <PageHeader
    kicker="CONFIGURACIÓN GLOBAL"
    kickerIcon={Building2}
    title="Gestión Institucional (RUE)"
    description="Central de configuraciones modulares del colegio. Estos datos impactan libretas y reportes oficiales SIE."
  />
);


export const RestrictedAccessAlert = () => (
  <div className="border-l-8 border-l-red-600 bg-red-50 p-8 text-left max-w-3xl mt-10 shadow-sm animate-in fade-in zoom-in-95 mx-auto">
    <AlertTriangle className="w-8 h-8 text-red-600 mb-4" />
    <h2 className="text-xl font-black uppercase tracking-tighter text-uecg-dark">Acceso Restringido</h2>
    <p className="text-[11px] font-bold text-uecg-gray mt-2 uppercase tracking-widest leading-relaxed">
      Esta es una zona raíz. No tienes los permisos ("manage:all:Institution") para visualizar o alterar la
      configuración estructural del colegio.
    </p>
  </div>
);
