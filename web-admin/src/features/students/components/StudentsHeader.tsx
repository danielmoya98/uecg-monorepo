import { GraduationCap, FileSpreadsheet, Plus, Download, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader, PageHeaderButton } from "@/shared/ui/page-header";

interface StudentsHeaderProps {
  currentYearName?: string;
  canCreateStudent: boolean;
  canDownloadReports: boolean;
  isLoaded: boolean;
  isFetching: boolean;
  isPending: boolean;
  onOpenMassiveExport: () => void;
}

export const StudentsHeader = ({
  currentYearName,
  canCreateStudent,
  canDownloadReports,
  isLoaded,
  isFetching,
  isPending,
  onOpenMassiveExport,
}: StudentsHeaderProps) => {
  return (
    <div className="relative w-full">
      {(isFetching || isPending) && (
        <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-20 border border-blue-100 shadow-sm">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
        </div>
      )}

      <PageHeader
        kicker={currentYearName ? `GESTIÓN ACTIVA: ${currentYearName}` : 'PADRÓN ESTUDIANTIL'}
        kickerIcon={GraduationCap}
        title="Población Escolar"
        description="Administración integral de estudiantes, expedientes RUDE y libretas Ley 070."
      >
        {/* Botón de Reportes Masivos */}
        {canDownloadReports && isLoaded && (
          <PageHeaderButton
            onClick={onOpenMassiveExport}
            icon={Download}
            variant="secondary"
          >
            Libreta por Curso
          </PageHeaderButton>
        )}

        {/* Botón para Migración por Curso (Excel) */}
        {canCreateStudent && isLoaded && (
          <Link
            to="/students/import"
            className="px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none bg-white border border-uecg-line text-uecg-dark hover:bg-gray-50 select-none"
          >
            <FileSpreadsheet className="w-4 h-4" /> Migración Excel
          </Link>
        )}

        {/* Botón para Nueva Inscripción Manual */}
        {canCreateStudent && isLoaded && (
          <Link
            to="/enrollments/new"
            className="px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none bg-uecg-dark text-white hover:bg-uecg-blue border-none select-none"
          >
            <Plus className="w-4 h-4" /> Registrar Alumno
          </Link>
        )}
      </PageHeader>
    </div>
  );
};

