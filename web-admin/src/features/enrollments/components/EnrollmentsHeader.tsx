import { FileText, Plus, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface EnrollmentsHeaderProps {
    canManageEnrollments: boolean;
    isFetching: boolean;
    isPending: boolean;
}

export const EnrollmentsHeader = ({ canManageEnrollments, isFetching, isPending }: EnrollmentsHeaderProps) => (
    <>
        {isFetching && !isPending && (
            <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1 animate-pulse rounded-sm z-10">
                <Loader2 className="w-3 h-3 animate-spin" /> Actualizando...
            </div>
        )}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
            <div>
                <span className="label-swiss !text-[10px] text-uecg-gray font-black uppercase tracking-widest">
                    {canManageEnrollments ? "Secretaría" : "Módulo Docente"}
                </span>
                <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
                    <FileText className="w-8 h-8 text-uecg-blue" />
                    {canManageEnrollments ? "Bandeja de Inscripciones" : "Mi Población Estudiantil"}
                </h1>
            </div>

            {canManageEnrollments && (
                <Link
                    to="/enrollments/new"
                    id="btn-new-enrollment"
                    data-tour="btn-new-enrollment"
                    className="px-5 py-3 font-bold uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-uecg-dark transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus className="w-4 h-4" /> Inscripción Manual / Ventanilla
                </Link>
            )}
        </header>
    </>
);
