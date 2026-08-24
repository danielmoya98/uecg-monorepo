import { FileText, Plus, Loader2 } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/shared/ui/page-header";

interface EnrollmentsHeaderProps {
    canManageEnrollments: boolean;
    isFetching?: boolean;
    isPending?: boolean;
}

export const EnrollmentsHeader = ({
    canManageEnrollments,
    isFetching = false,
    isPending = false,
}: EnrollmentsHeaderProps) => (
    <div className="relative w-full">
        {isFetching && !isPending && (
            <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-20 border border-blue-100 shadow-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
            </div>
        )}
        <PageHeader
            kicker={canManageEnrollments ? "SECRETARÍA" : "MÓDULO DOCENTE"}
            kickerIcon={FileText}
            title={canManageEnrollments ? "Bandeja de Inscripciones" : "Mi Población Estudiantil"}
            description="Revisión y validación de postulaciones y solicitudes de matrícula escolar."
        >
            {canManageEnrollments && (
                <Link
                    to="/enrollments/new"
                    id="btn-new-enrollment"
                    data-tour="btn-new-enrollment"
                    className="px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none bg-uecg-dark text-white hover:bg-uecg-blue border-none select-none"
                >
                    <Plus className="w-4 h-4" /> Inscripción Manual / Ventanilla
                </Link>
            )}
        </PageHeader>
    </div>
);

