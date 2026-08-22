import { useState } from "react";
import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { MASTER_SIDEBAR_LINKS } from "@/shared/constants/navigation";

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isExpanded, setIsExpanded] = useState(true);

  // 🟢 Cargamos la sesión e instrumentación ABAC directo de la memoria del Layout Padre
  const { user, can, canAny } = useRouteContext({ from: '/_authenticated' });

  const isAdmin = user?.role === "ADMINISTRADOR" || user?.role === "SUPER_ADMIN";

  const allowedLinks = MASTER_SIDEBAR_LINKS.filter((link) => {
    if (!user || !Array.isArray(user.permissions)) return false;

    // 1. Escudo anti-duplicados (hideIfHas)
    if (link.hideIfHas && link.hideIfHas.length > 0) {
      const shouldHide = link.hideIfHas.some((perm) => {
        const parts = perm.split(":");
        if (parts.length === 3) return can(`${parts[0]}:${parts[1]}`, parts[2]);
        return user.permissions.includes(perm);
      });
      if (shouldHide) return false;
    }

    // 2. Rutas públicas del ecosistema interno
    if (!link.permissions || link.permissions.length === 0) return true;

    // 3. Chequeo de habilidades ABAC
    return link.permissions.some((requiredPerm) => {
      const parts = requiredPerm.split(":");
      if (parts.length === 3) return can(`${parts[0]}:${parts[1]}`, parts[2]);
      return user.permissions.includes(requiredPerm) || canAny([{ action: "manage:all", subject: "all" }]);
    });
  });

  const accessLevel = isAdmin ? "ROOT / ADMIN" : user?.role || "GUEST";

  return (
    <aside className={`flex flex-col bg-uecg-dark h-full text-white transition-all duration-300 ease-in-out relative z-[100] border-r border-white/5 shadow-2xl ${isExpanded ? "w-[260px]" : "w-20"}`}>
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      <button onClick={() => setIsExpanded(!isExpanded)} className="absolute -right-4 top-10 flex h-8 w-8 items-center justify-center bg-uecg-blue text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-blue-500 hover:translate-x-0.5 focus:outline-none z-50 border border-white/20 cursor-pointer">
        {isExpanded ? <ChevronLeft className="h-4 w-4" strokeWidth={3} /> : <ChevronRight className="h-4 w-4" strokeWidth={3} />}
      </button>

      <div className={`relative z-10 border-b border-white/10 p-6 md:p-8 flex flex-col overflow-hidden whitespace-nowrap ${isExpanded ? "items-start" : "items-center px-0"}`}>
        <span className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 flex items-center gap-1 ${isExpanded ? "opacity-100" : "opacity-0 hidden"} ${isAdmin ? "text-[#00FF88]" : "text-blue-300/70"}`}>
          {isAdmin && <ShieldCheck className="w-3 h-3" />}
          {isAdmin ? "Sistema Raíz" : "Panel Operativo"}
        </span>
        <h2 className="text-3xl mt-1 text-white font-black tracking-tighter flex items-center gap-0.5">
          {isExpanded ? "U.E.C.G." : "U"}{!isExpanded && <span className="w-1.5 h-1.5 bg-uecg-blue mb-2" />}
        </h2>
      </div>

      <nav className="flex-1 flex flex-col pt-6 gap-1.5 px-3 overflow-y-auto custom-scrollbar relative z-10">
        {allowedLinks.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href));
          const Icon = link.icon;

          return (
            <Link key={link.name} to={link.href as any} title={!isExpanded ? link.name : ""} className={`flex items-center gap-3.5 py-3.5 transition-all duration-200 ease-out overflow-hidden relative group cursor-pointer ${isExpanded ? "px-4" : "justify-center px-0"} ${isActive ? "bg-uecg-blue shadow-md" : "hover:bg-white/5"}`}>
              <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${isActive ? "bg-white" : "bg-transparent group-hover:bg-white/20"}`} />
              <Icon className={`shrink-0 transition-transform duration-200 ${isActive ? "text-white scale-110" : "text-white/60 group-hover:text-white group-hover:scale-110"} ${isExpanded ? "w-4 h-4" : "w-5 h-5"}`} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`font-bold uppercase tracking-widest text-[10px] transition-all duration-300 ${isExpanded ? "opacity-100 w-auto translate-x-0" : "opacity-0 w-0 -translate-x-4 hidden"} ${isActive ? "text-white font-black" : "text-white/70 group-hover:text-white"}`}>{link.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className={`relative z-10 border-t border-white/10 p-6 md:p-8 whitespace-nowrap bg-black/20 ${isExpanded ? "text-left" : "text-center px-0 p-4"}`}>
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${isAdmin ? "text-[#00FF88]" : "text-white"}`}><span className="text-[10px] font-black">{isAdmin ? "SA" : "BO"}</span></div>
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 block">Nivel de Acceso</span>
              <span className="text-[10px] font-black mt-0.5 text-white/90 block tracking-widest uppercase truncate max-w-[150px]">{accessLevel}</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-help" title={`Nivel de Acceso: ${accessLevel}`}><span className="text-[9px] font-black text-white">{isAdmin ? "SA" : "BO"}</span></div>
        )}
      </div>
    </aside>
  );
}
