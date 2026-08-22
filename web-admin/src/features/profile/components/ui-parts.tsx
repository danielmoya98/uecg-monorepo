import { User, Loader2 } from "lucide-react";

export const ProfileHeader = () => (
  <header className= "flex flex-col border-b border-uecg-line pb-4" >
  <span className="label-swiss !text-[10px]" > Cuenta de Usuario </span>
    < h1 className = "text-4xl mt-1 tracking-tighter uppercase font-black text-uecg-text flex items-center gap-3" >
      <User className="w-8 h-8 text-uecg-blue" />
        Mi Perfil
          </h1>
          < p className = "mt-2 text-xs font-bold tracking-widest uppercase text-uecg-gray" >
            Gestione su información personal, contacto y credenciales de acceso.
        </p>
              </header>
);

export const ProfileLoader = () => (
  <div className= "flex items-center justify-center h-[70vh] animate-in fade-in" >
  <Loader2 className="w-10 h-10 animate-spin text-uecg-blue" />
    </div>
);
