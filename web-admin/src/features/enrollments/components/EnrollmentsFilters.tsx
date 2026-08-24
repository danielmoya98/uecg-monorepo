import { SwissSearchInput, SwissSelect } from "@/shared/ui";

interface EnrollmentsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export default function EnrollmentsFilters({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterTypeChange,
  viewMode,
  onViewModeChange,
}: EnrollmentsFiltersProps) {
  const types = [
    { id: "Todos", label: "TODAS LAS SOLICITUDES" },
    { id: "NUEVO", label: "NUEVOS" },
    { id: "ANTIGUO", label: "ANTIGUOS" },
    { id: "TRASPASO", label: "TRASPASOS" },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR ESTUDIANTE POR NOMBRE O CI... (CTRL+K)"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
        <SwissSelect
          value={filterType}
          onChange={onFilterTypeChange}
          options={types}
          placeholder="Todas las solicitudes"
          className="min-w-[240px]"
        />
      </div>
    </div>
  );
}
