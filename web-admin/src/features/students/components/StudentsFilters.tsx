import { SwissSearchInput, SwissSelect } from "@/shared/ui";

interface StudentsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  levelFilter: string;
  onLevelChange: (value: string) => void;
  classroomFilter: string;
  onClassroomChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  allowedLevels: string[];
  availableClassrooms: any[];
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
}

export default function StudentsFilters({
  searchTerm,
  onSearchChange,
  levelFilter,
  onLevelChange,
  classroomFilter,
  onClassroomChange,
  statusFilter,
  onStatusChange,
  allowedLevels,
  availableClassrooms,
  viewMode,
  onViewModeChange,
}: StudentsFiltersProps) {
  // Opciones de estado escolar
  const statusOptions = [
    { id: "TODOS", label: "TODOS LOS ESTADOS" },
    { id: "INSCRITO", label: "INSCRITOS" },
    { id: "REVISION_SIE", label: "REVISIÓN SIE" },
    { id: "RETIRADO", label: "RETIRADOS" },
  ];

  // Opciones de nivel
  const levelOptions = [
    { id: "", label: "TODOS LOS NIVELES" },
    ...allowedLevels.map((lvl) => ({ id: lvl, label: lvl })),
  ];

  // Opciones de cursos
  const classroomOptions = [
    { id: "", label: "TODOS LOS CURSOS" },
    ...availableClassrooms.map((c) => ({
      id: c.id,
      label: `${c.level.substring(0, 3)}. - ${c.grade} "${c.section}"`,
    })),
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Buscador Suizo con Toggle Table / Grid */}
      <SwissSearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="BUSCAR ESTUDIANTE (CTRL+K)..."
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        showViewToggle={true}
      />

      {/* Selectores Suizos en grupo */}
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <SwissSelect
          value={levelFilter}
          onChange={onLevelChange}
          options={levelOptions}
          placeholder="Todos los niveles"
        />

        <SwissSelect
          value={classroomFilter}
          onChange={onClassroomChange}
          options={classroomOptions}
          placeholder="Todos los cursos"
        />

        <SwissSelect
          value={statusFilter}
          onChange={onStatusChange}
          options={statusOptions}
          placeholder="Todos los estados"
        />
      </div>
    </div>
  );
}
