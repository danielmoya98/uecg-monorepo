import { Building2, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const SettingsHeader = () => (
  <PageHeader
    breadcrumbs={[
      { label: 'SISTEMA' },
      { label: 'CONFIGURACIÓN', href: '/settings' },
      { label: 'GESTIÓN INSTITUCIONAL (RUE)', icon: Building2 },
    ]}
    title="Gestión Institucional (RUE)"
    description="Central de configuraciones modulares del colegio. Estos datos impactan libretas y reportes oficiales SIE."
  />
);


export const SettingsSkeleton = () => (
  <div className="flex flex-col gap-8 w-full pb-20 animate-in fade-in duration-300">
    <SettingsHeader />


    {/* Formulario Institucional Skeleton */}
    <div className="border border-uecg-line bg-white shadow-sm flex flex-col animate-pulse">
      <div className="bg-uecg-dark p-6 text-white flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <div className="h-4 w-48 bg-white/20" />
          <div className="h-3 w-72 bg-white/10" />
        </div>
      </div>

      <div className="p-6 md:p-8 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-10 bg-gray-100 border border-uecg-line" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-10 bg-gray-100 border border-uecg-line" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-10 bg-gray-100 border border-uecg-line" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-10 bg-gray-100 border border-uecg-line" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-uecg-line">
          <div className="h-11 w-40 bg-gray-200" />
        </div>
      </div>
    </div>

    {/* Paneles Secundarios Skeleton */}
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="h-4 w-44 bg-gray-200" />
        <div className="h-3 w-80 bg-gray-100" />
        <div className="h-10 w-full bg-gray-50 border border-uecg-line mt-2" />
      </div>
      <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="h-4 w-44 bg-gray-200" />
        <div className="h-3 w-80 bg-gray-100" />
        <div className="h-10 w-full bg-gray-50 border border-uecg-line mt-2" />
      </div>
    </div>
  </div>
);

// Backward compatibility alias
export const SettingsLoading = SettingsSkeleton;

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
