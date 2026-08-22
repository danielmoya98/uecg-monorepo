import { useEffect, useRef } from "react";
import { Search, RefreshCcw, X } from "lucide-react";

interface DataUpdatesToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
}

export const DataUpdatesToolbar = ({
  searchTerm,
  onSearchChange,
  onRefresh,
}: DataUpdatesToolbarProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // ATAJO DE TECLADO (CTRL+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-0 border border-uecg-line bg-white shadow-sm">
      <div className="relative flex-1 group border-b md:border-b-0 md:border-r border-uecg-line bg-white hover:border-uecg-blue focus-within:border-uecg-blue transition-colors duration-200">
        <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
        <input
          ref={inputRef}
          type="text"
          placeholder="BUSCAR SOLICITUD POR NOMBRE O CI..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Buscar solicitud por nombre o documento de identidad"
          className="w-full bg-transparent pl-14 pr-24 py-4 text-uecg-text focus:outline-none uppercase text-[11px] font-black tracking-wider placeholder:text-uecg-gray/50"
        />

        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {!searchTerm && (
            <kbd className="hidden md:inline-block px-1.5 py-0.5 border border-uecg-line bg-gray-50 text-[9px] font-black text-uecg-gray uppercase tracking-tighter select-none">
              CTRL+K
            </kbd>
          )}
          {searchTerm && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              aria-label="Limpiar búsqueda"
              className="text-gray-400 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 p-1 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onRefresh}
        className="px-10 py-4 font-black uppercase tracking-widest text-[10px] bg-uecg-dark text-white hover:bg-black focus-visible:bg-black transition-colors flex items-center justify-center gap-2 outline-none cursor-pointer"
      >
        <RefreshCcw className="w-4 h-4" /> Refrescar
      </button>
    </div>
  );
};
export default DataUpdatesToolbar;
