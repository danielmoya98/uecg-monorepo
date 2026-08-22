import { GraduationCap, FileSpreadsheet, Plus, Download, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

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
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4">
      <div>
        <div className="flex items-center gap-3">
          <span className="bg-uecg-dark text-white px-2 py-0.5 text-[9px] font-black uppercase tracking-widest">
            Gestión {currentYearName || "..."}
          </span>
          {(isFetching || isPending) && (
            <span className="flex items-center gap-1.5 text-[10px] font-bold text-uecg-blue uppercase tracking-widest animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
            </span>
          )}
        </div>
        <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-uecg-blue" />
          Población Escolar
        </h1>
        <p className="mt-2 text-xs font-bold tracking-widest uppercase text-uecg-gray">
          Administración integral de estudiantes, expedientes RUDE y libretas Ley 070.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* 🔥 Botón de Reportes Masivos */}
        {canDownloadReports && isLoaded && (
          <button
            onClick={onOpenMassiveExport}
            className="flex items-center gap-2 px-4 py-3 bg-white text-uecg-dark border border-uecg-line font-black text-[10px] uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-colors cursor-pointer outline-none shadow-sm"
          >
            <Download className="w-4 h-4" /> Libreta por Curso
          </button>
        )}

        {/* 🔥 Botón para Migración por Curso (Excel) */}
        {canCreateStudent && isLoaded && (
          <Link
            to="/students/import"
            className="flex items-center gap-2 px-4 py-3 bg-white text-uecg-dark border border-uecg-line font-black text-[10px] uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-colors outline-none shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4" /> Migración Excel
          </Link>
        )}

        {/* 🔥 Botón para Nueva Inscripción Manual */}
        {canCreateStudent && isLoaded && (
          <Link
            to="/enrollments/new"
            className="flex items-center gap-2 px-4 py-3 bg-uecg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors outline-none shadow-sm border border-uecg-dark"
          >
            <Plus className="w-4 h-4" /> Registrar Alumno
          </Link>
        )}
      </div>
    </header>
  );
};
