import { User } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const ProfileHeader = () => (
  <PageHeader
    breadcrumbs={[
      { label: 'SISTEMA' },
      { label: 'USUARIO', href: '/profile' },
      { label: 'MI PERFIL', icon: User },
    ]}
    title="Mi Perfil"
    description="Gestione su información personal, contacto y credenciales de acceso institucional."
  />
);


export const ProfileSkeleton = () => (
  <div className="flex flex-col gap-6 w-full animate-in fade-in duration-300">
    <ProfileHeader />


    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
      {/* Columna Izquierda: Formulario y Logs */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        {/* Form Card Skeleton */}
        <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-6 animate-pulse">
          <div className="flex items-center gap-4 pb-4 border-b border-uecg-line">
            <div className="w-14 h-14 bg-gray-200 shrink-0" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-40 bg-gray-200" />
              <div className="h-3 w-28 bg-gray-100" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-gray-100" />
              <div className="h-10 bg-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-gray-100" />
              <div className="h-10 bg-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-gray-100" />
              <div className="h-10 bg-gray-200" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="h-3 w-24 bg-gray-100" />
              <div className="h-10 bg-gray-200" />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-uecg-line">
            <div className="h-10 w-36 bg-gray-200" />
          </div>
        </div>

        {/* Security Logs Skeleton */}
        <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4 animate-pulse">
          <div className="h-4 w-48 bg-gray-200 mb-2" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`log-sk-${i}`} className="flex justify-between items-center py-2 border-b border-uecg-line">
                <div className="h-3 w-36 bg-gray-200" />
                <div className="h-3 w-20 bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Columna Derecha: Seguridad y Sesiones */}
      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4 animate-pulse">
          <div className="h-4 w-40 bg-gray-200" />
          <div className="h-3 w-full bg-gray-100" />
          <div className="h-10 w-full bg-gray-200 mt-2" />
        </div>

        <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4 animate-pulse">
          <div className="h-4 w-40 bg-gray-200 mb-2" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={`sess-sk-${i}`} className="p-3 border border-uecg-line flex flex-col gap-2">
                <div className="h-3 w-32 bg-gray-200" />
                <div className="h-2.5 w-24 bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Backward compatibility alias
export const ProfileLoader = ProfileSkeleton;
