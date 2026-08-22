import { FileText, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const NewEnrollmentHeader = () => (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4">
        <div>
            <span className="label-swiss !text-[10px] text-uecg-gray font-black uppercase tracking-widest">
                Secretaría / Ventanilla
            </span>
            <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
                <FileText className="w-8 h-8 text-uecg-blue" />
                Nueva Inscripción Manual
            </h1>
            <p className="mt-2 text-xs font-bold tracking-widest uppercase text-uecg-gray">
                Transcripción directa de fólders físicos entregados por los padres.
            </p>
        </div>

        <Link
            to="/enrollments"
            className="px-5 py-3 font-bold uppercase tracking-widest text-[11px] border border-uecg-line text-uecg-gray hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
            <ArrowLeft className="w-4 h-4" /> Volver a Bandeja
        </Link>
    </header>
);
