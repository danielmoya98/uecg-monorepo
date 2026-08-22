

import { Check, FileText, Loader2, Printer, X } from "lucide-react";

interface EnrollmentsGridProps {
    enrollments: any[];
    isPending: boolean;
    isFetching: boolean;
    generatingPdfId: string | null;
    onPrint: (id: string) => void;
    onApprove: (enrollment: any) => void;
    onReject: (id: string) => void;
    canManage: boolean;
}

const getBadgeStyles = (type: string) => {
    if (type === "NUEVO") return "bg-uecg-dark text-white border-uecg-dark";
    if (type === "TRASPASO") return "bg-yellow-500 text-white border-yellow-500";
    return "bg-uecg-blue text-white border-uecg-blue"; // ANTIGUO
};

const getLabelStyles = (type: string) => {
    if (type === "NUEVO") return "bg-gray-100 text-uecg-dark border-gray-200";
    if (type === "TRASPASO") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-blue-50 text-uecg-blue border-blue-100"; // ANTIGUO
};

export default function EnrollmentsGrid({
    enrollments,
    isPending,
    isFetching,
    generatingPdfId,
    onPrint,
    onApprove,
    onReject,
    canManage,
}: EnrollmentsGridProps) {
    return (
        <div
            className={`transition-opacity duration-200 pb-16 ${isFetching && !isPending ? "opacity-50 pointer-events-none" : "opacity-100"}`}
        >
            {isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="border border-uecg-line bg-white h-[200px] animate-pulse shadow-sm"
                        ></div>
                    ))}
                </div>
            ) : enrollments.length === 0 ? (
                <div className="border border-uecg-line bg-white flex flex-col items-center justify-center py-20 opacity-80 animate-in fade-in zoom-in-95 shadow-sm">
                    <div className="relative w-24 h-24 mb-6">
                        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-uecg-line rounded-none rotate-12"></div>
                        <div className="absolute bottom-0 right-0 w-12 h-12 bg-gray-100 -rotate-12"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-3 shadow-sm border border-uecg-line">
                            <FileText className="w-6 h-6 text-uecg-gray" strokeWidth={1.5} />
                        </div>
                    </div>
                    <h3 className="font-black uppercase tracking-widest text-xs text-uecg-dark mb-1">Bandeja Vacía</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray">
                        No hay solicitudes pendientes de revisión.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-300">
                    {enrollments.map((req) => {
                        const initial = req.studentName.charAt(0).toUpperCase();

                        return (
                            <div
                                key={req.id}
                                className={`group flex flex-col text-left border border-uecg-line bg-white h-[210px] relative overflow-hidden transition-all duration-300 ${
                                    canManage ? "hover:border-uecg-blue hover:shadow-lg" : "opacity-90"
                                }`}
                            >
                                {/* Fondo Abstracto Geométrico */}
                                {canManage && (
                                    <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500"></div>
                                )}

                                <div className="p-5 flex-1 w-full relative z-10 flex flex-col">
                                    <div className="flex justify-between items-start w-full mb-3">
                                        <div
                                            className={`w-10 h-10 flex items-center justify-center font-black text-xl shadow-sm shrink-0 border ${getBadgeStyles(req.type)}`}
                                        >
                                            {initial}
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span
                                                className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border shadow-sm ${getLabelStyles(req.type)}`}
                                            >
                                                {req.type}
                                            </span>
                                            <span className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-1">
                                                {req.date}
                                            </span>
                                        </div>
                                    </div>

                                    <h3
                                        className={`text-[15px] font-black uppercase tracking-tighter text-uecg-dark mt-1 leading-tight transition-colors line-clamp-2 ${canManage ? "group-hover:text-uecg-blue" : ""}`}
                                        title={req.studentName}
                                    >
                                        {req.studentName}
                                    </h3>

                                    <div className="mt-auto w-full flex flex-col gap-1">
                                        <span className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest">
                                            CI: {req.ci}
                                        </span>
                                        {req.classroom && (
                                            <span className="text-[10px] font-black text-uecg-blue uppercase tracking-widest truncate block w-fit max-w-full">
                                                {req.classroom}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* 🔥 BARRA INFERIOR DIVIDIDA: Acciones Administrativas */}
                                <div className="w-full border-t border-uecg-line bg-gray-50 flex h-12 relative z-10 divide-x divide-uecg-line">
                                    {/* Imprimir RUDE */}
                                    <button
                                        onClick={() => onPrint(req.id)}
                                        disabled={generatingPdfId !== null || !canManage}
                                        className={`flex-1 flex items-center justify-center transition-colors outline-none h-full ${
                                            canManage
                                                ? "hover:bg-gray-100 text-uecg-dark"
                                                : "bg-gray-100 text-gray-300 cursor-not-allowed"
                                        }`}
                                        title="Imprimir RUDE"
                                    >
                                        {generatingPdfId === req.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Printer className="w-4 h-4" />
                                        )}
                                    </button>

                                    {/* Aprobar */}
                                    {canManage ? (
                                        <button
                                            onClick={() => onApprove(req)}
                                            disabled={generatingPdfId !== null}
                                            className="flex-1 flex items-center justify-center bg-uecg-dark text-white hover:bg-uecg-blue transition-colors outline-none h-full disabled:opacity-50"
                                            title="Aprobar Inscripción"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed h-full">
                                            <Check className="w-4 h-4" />
                                        </div>
                                    )}

                                    {/* Rechazar */}
                                    {canManage ? (
                                        <button
                                            onClick={() => onReject(req.id)}
                                            disabled={generatingPdfId !== null}
                                            className="flex-1 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors outline-none h-full disabled:opacity-50"
                                            title="Rechazar Inscripción"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <div className="flex-1 flex items-center justify-center bg-gray-100 text-gray-300 cursor-not-allowed h-full">
                                            <X className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
