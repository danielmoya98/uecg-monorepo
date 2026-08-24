import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Search, X, Command } from "lucide-react";
import { MASTER_SIDEBAR_LINKS } from "@/shared/constants/navigation";

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);

  // 🟢 Consumimos los permisos inyectados de memoria central
  const { user, can } = useRouteContext({ from: '/_authenticated' });

  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setIsOpen(true); }
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredModules = MASTER_SIDEBAR_LINKS.filter((link) => {
    if (!user) return false;
    if (can("manage:all", "all")) return true;
    return link.permissions.some((requiredPerm) => user.permissions.includes(requiredPerm));
  }).filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || (m.desc && m.desc.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="flex items-center w-full max-w-[320px] relative group text-left border border-uecg-line bg-gray-50 hover:bg-white hover:border-uecg-blue transition-all shadow-inner focus:outline-none cursor-pointer">
        <Search className="absolute left-3 w-4 h-4 text-uecg-gray group-hover:text-uecg-blue transition-colors" />
        <span className="w-full pl-10 pr-16 py-2.5 text-[10px] font-black tracking-widest uppercase text-uecg-gray group-hover:text-uecg-text transition-colors">Navegador de Sistema</span>
        <div className="absolute right-2.5 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity"><kbd className="font-sans text-[9px] font-black uppercase bg-white border border-uecg-line px-1.5 py-0.5 text-uecg-gray shadow-sm flex items-center gap-1"><Command className="w-2.5 h-2.5" /> K</kbd></div>
      </button>

      {mounted && isOpen && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[12vh] pointer-events-auto">
          <div className="absolute inset-0 bg-uecg-dark/75 will-change-[opacity] transform-gpu transition-opacity duration-200 cursor-pointer" onClick={() => setIsOpen(false)} />
          <div className="w-full max-w-3xl bg-white border border-uecg-line shadow-2xl flex flex-col overflow-hidden relative z-10 mx-4 will-change-transform transform-gpu animate-in fade-in zoom-in-95 duration-150">
            <div className="relative flex items-center border-b border-uecg-line bg-gray-50 p-2">
              <Search className="absolute left-6 w-6 h-6 text-uecg-blue" />
              <input type="text" autoFocus placeholder="¿QUÉ MÓDULO BUSCAS?" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent pl-16 pr-16 py-6 text-2xl md:text-3xl font-black uppercase tracking-tighter text-uecg-text focus:outline-none placeholder:text-uecg-gray/50" />
              <button onClick={() => setIsOpen(false)} className="absolute right-6 p-2 text-uecg-gray hover:text-red-500 transition-colors border border-transparent outline-none cursor-pointer"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col max-h-[55vh] overflow-y-auto p-4 custom-scrollbar bg-white">
              <p className="px-4 py-2 text-[9px] uppercase tracking-widest text-uecg-gray font-bold border-b border-uecg-line mb-2">{filteredModules.length > 0 ? "Resultados de Navegación" : "No se encontraron coincidencias"}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredModules.map((mod, idx) => {
                  const Icon = mod.icon;
                  return (
                    <Link key={idx} to={mod.href as any} onClick={() => setIsOpen(false)} className="flex items-start gap-4 p-4 border border-transparent hover:border-uecg-blue hover:bg-blue-50 group transition-all outline-none cursor-pointer">
                      <div className="w-10 h-10 bg-gray-50 group-hover:bg-uecg-blue flex items-center justify-center transition-colors shrink-0 shadow-sm border border-uecg-line group-hover:border-uecg-blue"><Icon className="w-5 h-5 text-uecg-gray group-hover:text-white transition-colors" /></div>
                      <div className="flex flex-col mt-0.5"><h4 className="text-[11px] font-black uppercase tracking-widest text-uecg-text group-hover:text-uecg-blue transition-colors leading-none">{mod.name}</h4><p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray group-hover:text-uecg-blue/80 transition-colors mt-1.5 leading-relaxed line-clamp-2">{mod.desc}</p></div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>, document.body
      )}
    </>
  );
}
