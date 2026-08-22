import { Search } from "lucide-react";

interface AuditToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onResetPage: () => void;
}

export const AuditToolbar = ({
  searchTerm,
  onSearchChange,
  onResetPage,
}: AuditToolbarProps) => (
  <div className="relative w-full md:w-1/3">
    <label htmlFor="audit-search-input" className="sr-only">
      Buscar en registros de auditoría
    </label>
    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray" aria-hidden="true" />
    <input
      id="audit-search-input"
      type="text"
      placeholder="BUSCAR LOGS (Actor, Ruta, Método...)"
      value={searchTerm}
      onChange={(e) => {
        onSearchChange(e.target.value);
        onResetPage();
      }}
      className="w-full border border-uecg-line bg-transparent pl-10 pr-4 py-2.5 text-uecg-text focus:border-uecg-blue focus:outline-none uppercase text-[11px] font-bold tracking-wider transition-colors placeholder:text-uecg-gray/70"
    />
  </div>
);
