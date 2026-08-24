import { User, Loader2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/page-header";

export const ProfileHeader = () => (
  <PageHeader
    kicker="CUENTA DE USUARIO"
    kickerIcon={User}
    title="Mi Perfil"
    description="Gestione su información personal, contacto y credenciales de acceso institucional."
  />
);


export const ProfileLoader = () => (
  <div className= "flex items-center justify-center h-[70vh] animate-in fade-in" >
  <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
    </div>
);
