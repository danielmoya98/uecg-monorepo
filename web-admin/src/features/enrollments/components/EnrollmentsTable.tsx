import { useState, useRef, useEffect } from "react";
import { Loader2, MoreVertical, Check, X, Printer } from "lucide-react";
import { SwissTableContainer, SwissEmptyState } from "@/shared/ui";

// ==========================================
// COMPONENTE VISUAL: Emblema de Estudiante
// ==========================================
const StudentBadge = ({ type, name }: { type: string; name: string }) => {
    const initial = name.charAt(0).toUpperCase();
    let bgColor = "bg-uecg-blue"; // Default (Antiguo)
    if (type === "NUEVO") bgColor = "bg-uecg-dark";
    if (type === "TRASPASO") bgColor = "bg-yellow-500";

    return (
        <div
            className={`w-9 h-9 flex items-center justify-center ${bgColor} text-white font-black text-sm shadow-sm shrink-0 select-none`}
        >
            {initial}
        </div>
    );
};

// ==========================================
// COMPONENTE SRP: Fila de la Tabla
// ==========================================
interface EnrollmentsTableRowProps {
    req: any;
    index: number;
    generatingPdfId: string | null;
    onPrint: (id: string) => void;
    onApprove: (enrollment: any) => void;
    onReject: (id: string) => void;
    canManage: boolean;
}

const EnrollmentsTableRow = ({
    req,
    index,
    generatingPdfId,
    onPrint,
    onApprove,
    onReject,
    canManage,
}: EnrollmentsTableRowProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAction = (actionFn: Function, param: any) => {
        setIsOpen(false);
        actionFn(param);
    };

    return (
        <tr
            className="border-b border-uecg-line dark:border-zinc-800 hover:bg-blue-50/20 dark:hover:bg-zinc-800/40 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${index * 25}ms` }}
        >
            <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800">
                <div className="flex items-center gap-3.5">
                    <StudentBadge type={req.type} name={req.studentName} />
                    <div className="flex flex-col">
                        <p className="font-black uppercase tracking-tight text-xs text-uecg-text dark:text-zinc-100">{req.studentName}</p>
                        <p className="text-[9px] font-bold text-uecg-gray dark:text-zinc-400 uppercase tracking-widest mt-0.5">
                            CI: {req.ci || "S/CI"}
                        </p>
                        {req.classroom && (
                            <p className="text-[9px] font-black text-uecg-blue dark:text-blue-400 uppercase tracking-widest mt-0.5">
                                {req.classroom}
                            </p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800">
                <span
                    className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 shadow-sm border ${
                        req.type === "NUEVO"
                            ? "bg-uecg-dark text-white border-transparent"
                            : req.type === "TRASPASO"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800"
                              : "bg-blue-50 text-uecg-blue border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                    }`}
                >
                    {req.type}
                </span>
            </td>
            <td className="px-4 py-3 border-r border-uecg-line dark:border-zinc-800 text-[11px] font-bold text-uecg-gray dark:text-zinc-400 text-center">
                {req.date}
            </td>
            
            {canManage && (
                <td className="px-4 py-3 text-center">
                    <div ref={menuRef} className="relative inline-block">
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-uecg-gray dark:text-zinc-400 hover:text-uecg-blue dark:hover:text-white transition-colors focus:outline-none p-1.5 bg-transparent hover:bg-white dark:hover:bg-zinc-800 border border-transparent hover:border-uecg-line dark:hover:border-zinc-700 cursor-pointer"
                        >
                            {generatingPdfId === req.id ? (
                                <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                            ) : (
                                <MoreVertical className="w-4 h-4 mx-auto" />
                            )}
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-8 w-48 bg-white dark:bg-zinc-900 border border-uecg-line dark:border-zinc-700 shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-3 py-2 border-b border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/60 flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400">
                                        Revisión RUDE
                                    </span>
                                    {req.rudeCode && (
                                        <span className="text-[8px] bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-400 px-1 font-bold rounded-sm border border-green-200 dark:border-green-800">
                                            CON SIE
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleAction(onPrint, req.id)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors text-uecg-text dark:text-zinc-200 w-full text-left disabled:opacity-50 cursor-pointer"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Imprimir RUDE
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction(onApprove, req)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-dark hover:bg-uecg-blue transition-colors border-t border-uecg-line dark:border-zinc-800 w-full text-left disabled:opacity-50 cursor-pointer"
                                >
                                    <Check className="w-3.5 h-3.5" /> Aprobar
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleAction(onReject, req.id)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white transition-colors border-t border-uecg-line dark:border-zinc-800 w-full text-left disabled:opacity-50 cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" /> Rechazar
                                </button>
                            </div>
                        )}
                    </div>
                </td>
            )}
        </tr>
    );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
interface EnrollmentsTableProps {
    enrollments: any[];
    isPending: boolean;
    isFetching: boolean;
    generatingPdfId: string | null;
    onPrint: (id: string) => void;
    onApprove: (enrollment: any) => void;
    onReject: (id: string) => void;
    canManage: boolean;
}

export default function EnrollmentsTable({
    enrollments,
    isPending,
    isFetching,
    generatingPdfId,
    onPrint,
    onApprove,
    onReject,
    canManage,
}: EnrollmentsTableProps) {
    const columnCount = canManage ? 4 : 3;

    return (
        <SwissTableContainer isFetching={isFetching} isPending={isPending}>
            <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 z-20 bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line dark:border-zinc-800 shadow-sm">
                    <tr>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                            Estudiante Solicitante
                        </th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                            Tipo Inscripción
                        </th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 border-r border-uecg-line dark:border-zinc-800 text-center bg-gray-50 dark:bg-zinc-900">
                            Fecha Solicitud
                        </th>
                        {canManage && (
                            <th className="px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-uecg-gray dark:text-zinc-400 text-center w-20 bg-gray-50 dark:bg-zinc-900">
                                Acción
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {isPending ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="border-b border-uecg-line dark:border-zinc-800 animate-pulse">
                                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800 flex items-center gap-4">
                                    <div className="w-9 h-9 bg-gray-200 dark:bg-zinc-800 shrink-0" />
                                    <div className="flex flex-col gap-2">
                                        <div className="h-3 w-40 bg-gray-200 dark:bg-zinc-800" />
                                        <div className="h-2 w-20 bg-gray-100 dark:bg-zinc-800/60" />
                                    </div>
                                </td>
                                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                                    <div className="h-5 w-20 bg-gray-200 dark:bg-zinc-800" />
                                </td>
                                <td className="px-4 py-4 border-r border-uecg-line dark:border-zinc-800">
                                    <div className="h-4 w-24 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                                </td>
                                {canManage && (
                                    <td className="px-4 py-4">
                                        <div className="h-4 w-4 bg-gray-200 dark:bg-zinc-800 mx-auto" />
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : enrollments.length === 0 ? (
                        <tr>
                            <td colSpan={columnCount} className="p-0">
                                <SwissEmptyState
                                    title="Sin Solicitudes"
                                    description="No se encontraron trámites de inscripción registrados."
                                />
                            </td>
                        </tr>
                    ) : (
                        enrollments.map((req: any, index: number) => (
                            <EnrollmentsTableRow
                                key={req.id}
                                req={req}
                                index={index}
                                generatingPdfId={generatingPdfId}
                                onPrint={onPrint}
                                onApprove={onApprove}
                                onReject={onReject}
                                canManage={canManage}
                            />
                        ))
                    )}
                </tbody>
            </table>
        </SwissTableContainer>
    );
}