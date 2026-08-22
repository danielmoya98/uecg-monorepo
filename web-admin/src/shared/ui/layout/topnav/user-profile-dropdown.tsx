import { useState, useEffect, useRef } from "react";
import { Link, useRouteContext } from "@tanstack/react-router";
import { Settings, LogOut, ChevronDown, User, Calendar } from "lucide-react";
import { AuthService } from "@/features/auth";

export default function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🟢 Consumo de credenciales síncrono sin loaders parciales
  const { user, can } = useRouteContext({ from: '/_authenticated' });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 focus:outline-none group bg-transparent cursor-pointer">
        <div className="text-right hidden md:block">
          <span className="label-swiss !mb-0 !text-[8px] text-uecg-gray tracking-widest uppercase">Credencial Activa</span>
          <span className="font-black text-uecg-text text-[10px] uppercase group-hover:text-uecg-blue transition-colors block mt-0.5 tracking-widest">{user?.role || "GUEST"}</span>
        </div>
        <div className="w-10 h-10 bg-uecg-dark flex items-center justify-center text-white font-black text-sm border-2 border-transparent group-hover:border-uecg-blue group-hover:bg-uecg-blue transition-colors shadow-sm">
          {getInitials(user?.fullName)}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-uecg-gray transition-transform ${isOpen ? "rotate-180 text-uecg-blue" : ""}`} strokeWidth={2.5} />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-4 w-64 border border-uecg-line bg-white shadow-2xl z-50 transition-all duration-200">
          <div className="p-5 border-b border-uecg-line bg-uecg-dark text-white relative overflow-hidden">
            <p className="text-[8px] uppercase tracking-widest text-blue-200 font-bold mb-1">Sesión Autorizada</p>
            <p className="text-sm font-black text-white uppercase tracking-tight truncate leading-none">{user?.fullName || "Docente"}</p>
            <p className="text-[10px] font-bold mt-1.5 text-gray-300 truncate">{user?.email || "--"}</p>
          </div>
          <div className="flex flex-col bg-white">
            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-text hover:bg-gray-50 hover:text-uecg-blue transition-colors border-b border-uecg-line/50 cursor-pointer"><User className="w-4 h-4" /> Perfil de Usuario</Link>

            {can("manage:all", "AcademicYear") && (
              <Link to="/academic-years" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-text hover:bg-gray-50 hover:text-uecg-blue transition-colors border-b border-uecg-line/50 cursor-pointer"><Calendar className="w-4 h-4" /> Gestión Académica</Link>
            )}

            {can("manage:all", "Institution") && (
              <Link to="/settings" onClick={() => setIsOpen(false)} className="flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-uecg-text hover:bg-gray-50 hover:text-uecg-blue transition-colors cursor-pointer"><Settings className="w-4 h-4" /> Configuración Global RUE</Link>
            )}

            <button onClick={() => AuthService.logout()} className="flex items-center gap-3 px-5 py-4 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 border-t border-uecg-line hover:bg-red-600 hover:text-white transition-colors w-full text-left cursor-pointer"><LogOut className="w-4 h-4" /> Finalizar Sesión</button>
          </div>
        </div>
      )}
    </div>
  );
}
