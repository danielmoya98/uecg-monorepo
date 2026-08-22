import { Building2, Loader2, AlertTriangle } from "lucide-react";

export const SettingsLoading = () => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4 animate-in fade-in">
    <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
    <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray animate-pulse">
      Obteniendo configuración central...
    </span>
  </div>
);

export const SettingsHeader = () => (
  <header className="flex flex-col border-b border-uecg-line pb-4 mt-2">
    <span className="label-swiss !text-[10px] text-uecg-gray">Configuración Global</span>
    <h1 className="text-4xl mt-1 tracking-tighter uppercase font-black text-uecg-text flex items-center gap-3">
      <Building2 className="w-8 h-8 text-uecg-blue" strokeWidth={2.5} />
      Gestión Institucional (RUE)
    </h1>
    <p className="mt-2 text-[11px] font-bold tracking-widest uppercase text-uecg-gray border border-uecg-line bg-gray-50 px-3 py-1.5 inline-block w-max">
      Central de configuraciones modulares del colegio. Estos datos impactan libretas y reportes SIE.
    </p>
  </header>
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
