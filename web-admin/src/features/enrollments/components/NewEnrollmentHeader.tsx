import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageHeader } from "@/shared/ui/page-header";
import { SwissKbd } from "@/shared/ui/swiss-kbd";

export const NewEnrollmentHeader = () => (
    <PageHeader
        breadcrumbs={[
            { label: 'SECRETARÍA' },
            { label: 'BANDEJA DE INSCRIPCIONES', href: '/enrollments' },
            { label: 'NUEVA INSCRIPCIÓN', icon: FileText },
        ]}
        title="Nueva Inscripción Manual"
        description="Transcripción directa de fólders físicos entregados por los padres de familia."
    >
        <Link
            to="/enrollments"
            className="px-6 py-4 font-black uppercase tracking-widest text-[11px] flex items-center gap-3 shadow-sm transition-all cursor-pointer outline-none bg-white border border-uecg-line text-uecg-dark hover:bg-gray-50 select-none"
        >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Bandeja</span>
            <SwissKbd className="ml-1 opacity-70">ESC</SwissKbd>
        </Link>
    </PageHeader>
);
export default NewEnrollmentHeader;
