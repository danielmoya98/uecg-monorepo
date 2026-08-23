import { useState, useEffect } from "react";
import { Link, useLocation, useRouteContext } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ChevronDown, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MASTER_SIDEBAR_CATEGORIES, type NavItem } from "@/shared/constants/navigation";

export function Sidebar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [isExpanded, setIsExpanded] = useState(true);

  // 🟢 Cargamos la sesión e instrumentación ABAC directo de la memoria del Layout Padre
  const { user, can, canAny } = useRouteContext({ from: '/_authenticated' });

  const isAdmin = user?.role === "ADMINISTRADOR" || user?.role === "SUPER_ADMIN";

  // Función de filtrado ABAC por ítem
  const isItemAllowed = (link: NavItem): boolean => {
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
  };

  // Filtramos categorías y sus ítems autorizados
  const allowedCategories = MASTER_SIDEBAR_CATEGORIES.map((category) => ({
    ...category,
    items: category.items.filter(isItemAllowed),
  })).filter((category) => category.items.length > 0);

  // Estado del acordeón: qué categorías están desplegadas
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    allowedCategories.forEach((cat) => {
      initial[cat.id] = true; // Abiertas por defecto
    });
    return initial;
  });

  // Auto-abrir la categoría de la ruta activa al navegar
  useEffect(() => {
    allowedCategories.forEach((category) => {
      const hasActiveChild = category.items.some(
        (item) => pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))
      );
      if (hasActiveChild && !openCategories[category.id]) {
        setOpenCategories((prev) => ({ ...prev, [category.id]: true }));
      }
    });
  }, [pathname, allowedCategories]);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const accessLevel = isAdmin ? "ROOT / ADMIN" : user?.role || "GUEST";

  return (
    <aside
      className={`flex flex-col bg-uecg-dark h-full text-white transition-all duration-300 ease-in-out relative z-[100] border-r border-white/5 shadow-2xl ${
        isExpanded ? "w-[270px]" : "w-20"
      }`}
    >
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
      
      {/* Botón flotante para colapsar/expandir */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-4 top-10 flex h-8 w-8 items-center justify-center bg-uecg-blue text-white shadow-[2px_2px_0px_rgba(0,0,0,0.3)] transition-all hover:bg-blue-500 hover:translate-x-0.5 focus:outline-none z-50 border border-white/20 cursor-pointer"
        aria-label={isExpanded ? "Colapsar menú" : "Expandir menú"}
      >
        {isExpanded ? <ChevronLeft className="h-4 w-4" strokeWidth={3} /> : <ChevronRight className="h-4 w-4" strokeWidth={3} />}
      </button>

      {/* Header Institucional */}
      <div
        className={`relative z-10 border-b border-white/10 p-6 flex flex-col overflow-hidden whitespace-nowrap ${
          isExpanded ? "items-start" : "items-center px-0"
        }`}
      >
        <span
          className={`text-[8px] font-black uppercase tracking-[0.3em] mb-1 flex items-center gap-1 transition-opacity ${
            isExpanded ? "opacity-100" : "opacity-0 hidden"
          } ${isAdmin ? "text-[#00FF88]" : "text-blue-300/70"}`}
        >
          {isAdmin && <ShieldCheck className="w-3 h-3" />}
          {isAdmin ? "Sistema Raíz" : "Panel Operativo"}
        </span>
        <h2 className="text-2xl mt-0.5 text-white font-black tracking-tighter flex items-center gap-1">
          {isExpanded ? "U.E.C.G." : "U"}
          {!isExpanded && <span className="w-1.5 h-1.5 bg-uecg-blue mb-2" />}
        </h2>
      </div>

      {/* Navegación Categorizada con Acordeón */}
      <nav className="flex-1 flex flex-col pt-4 gap-4 px-3 overflow-y-auto custom-scrollbar relative z-10">
        {allowedCategories.map((category) => {
          const isCategoryOpen = openCategories[category.id] ?? true;
          const isSingleItem = category.items.length === 1 && category.id === "main";

          return (
            <div key={category.id} className="flex flex-col">
              {/* Encabezado de la Categoría */}
              {isExpanded && !isSingleItem && (
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="flex items-center justify-between px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/90 transition-colors group cursor-pointer focus:outline-none"
                >
                  <span className="truncate">{category.title}</span>
                  <ChevronDown
                    className={`w-3 h-3 text-white/30 group-hover:text-white/80 transition-transform duration-200 ${
                      isCategoryOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                </button>
              )}

              {/* Separador sutil en modo colapsado */}
              {!isExpanded && !isSingleItem && (
                <div className="w-8 h-px bg-white/10 mx-auto my-2" />
              )}

              {/* Lista de Enlaces con Animación Suave */}
              {isExpanded && !isSingleItem ? (
                <AnimatePresence initial={false}>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden flex flex-col gap-1 pt-1"
                    >
                      {category.items.map((link) => {
                        const isActive =
                          pathname === link.href ||
                          (link.href !== "/dashboard" && pathname.startsWith(link.href));
                        const Icon = link.icon;

                        return (
                          <Link
                            key={link.name}
                            to={link.href as any}
                            className={`flex items-center gap-3 py-2.5 px-3.5 transition-all duration-200 ease-out overflow-hidden relative group cursor-pointer ${
                              isActive ? "bg-uecg-blue shadow-md text-white" : "hover:bg-white/5 text-white/70 hover:text-white"
                            }`}
                          >
                            <div
                              className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                                isActive ? "bg-white" : "bg-transparent group-hover:bg-white/20"
                              }`}
                            />
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                                isActive ? "text-white scale-110" : "text-white/60 group-hover:text-white group-hover:scale-110"
                              }`}
                              strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span
                              className={`uppercase tracking-widest text-[10px] transition-colors truncate ${
                                isActive ? "font-black text-white" : "font-bold text-white/70 group-hover:text-white"
                              }`}
                            >
                              {link.name}
                            </span>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              ) : (
                <div className="flex flex-col gap-1">
                  {category.items.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/dashboard" && pathname.startsWith(link.href));
                    const Icon = link.icon;

                    return (
                      <Link
                        key={link.name}
                        to={link.href as any}
                        title={!isExpanded ? link.name : ""}
                        className={`flex items-center gap-3.5 py-3 transition-all duration-200 ease-out overflow-hidden relative group cursor-pointer ${
                          isExpanded ? "px-4" : "justify-center px-0"
                        } ${isActive ? "bg-uecg-blue shadow-md" : "hover:bg-white/5"}`}
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-200 ${
                            isActive ? "bg-white" : "bg-transparent group-hover:bg-white/20"
                          }`}
                        />
                        <Icon
                          className={`shrink-0 transition-transform duration-200 ${
                            isActive ? "text-white scale-110" : "text-white/60 group-hover:text-white group-hover:scale-110"
                          } ${isExpanded ? "w-4 h-4" : "w-5 h-5"}`}
                          strokeWidth={isActive ? 2.5 : 2}
                        />
                        {isExpanded && (
                          <span
                            className={`font-bold uppercase tracking-widest text-[10px] transition-colors truncate ${
                              isActive ? "text-white font-black" : "text-white/70 group-hover:text-white"
                            }`}
                          >
                            {link.name}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer de Nivel de Acceso */}
      <div
        className={`relative z-10 border-t border-white/10 p-5 whitespace-nowrap bg-black/20 ${
          isExpanded ? "text-left" : "text-center px-0 p-4"
        }`}
      >
        {isExpanded ? (
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 bg-white/5 border border-white/10 flex items-center justify-center shrink-0 ${
                isAdmin ? "text-[#00FF88]" : "text-white"
              }`}
            >
              <span className="text-[10px] font-black">{isAdmin ? "SA" : "BO"}</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/50 block">Nivel de Acceso</span>
              <span className="text-[10px] font-black mt-0.5 text-white/90 block tracking-widest uppercase truncate max-w-[170px]">
                {accessLevel}
              </span>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 mx-auto bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-help"
            title={`Nivel de Acceso: ${accessLevel}`}
          >
            <span className="text-[9px] font-black text-white">{isAdmin ? "SA" : "BO"}</span>
          </div>
        )}
      </div>
    </aside>
  );
}
