

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
            className={`w-10 h-10 flex items-center justify-center ${bgColor} text-white font-black text-xl shadow-sm shrink-0`}
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
    canManage: boolean; // 🔥 Propiedad ABAC recibida
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
            className="border-b border-uecg-line hover:bg-blue-50/30 transition-colors group animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <td className="px-4 py-3 border-r border-uecg-line">
                <div className="flex items-center gap-4">
                    <StudentBadge type={req.type} name={req.studentName} />
                    <div className="flex flex-col">
                        <p className="font-black uppercase tracking-tight text-xs text-uecg-text">{req.studentName}</p>
                        <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
                            CI: {req.ci}
                        </p>
                        {/* 🔥 El curso es útil si el docente está viendo la lista */}
                        {req.classroom && (
                            <p className="text-[9px] font-black text-uecg-blue uppercase tracking-widest mt-1">
                                {req.classroom}
                            </p>
                        )}
                    </div>
                </div>
            </td>
            <td className="px-4 py-3 border-r border-uecg-line">
                <span
                    className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 shadow-sm border ${
                        req.type === "NUEVO"
                            ? "bg-uecg-dark text-white border-transparent"
                            : req.type === "TRASPASO"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-blue-50 text-uecg-blue border-blue-100"
                    }`}
                >
                    {req.type}
                </span>
            </td>
            <td className="px-4 py-3 border-r border-uecg-line text-[11px] font-bold text-uecg-gray text-center">
                {req.date}
            </td>
            
            {/* 🔥 ESCUDO: Solo renderizamos la celda de acción si tiene permisos */}
            {canManage && (
                <td className="px-4 py-3 text-center">
                    <div ref={menuRef} className="relative inline-block">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-uecg-gray hover:text-uecg-blue transition-colors focus:outline-none p-1.5 rounded-none bg-transparent hover:bg-white border border-transparent hover:border-uecg-line"
                        >
                            {generatingPdfId === req.id ? (
                                <Loader2 className="w-4 h-4 mx-auto animate-spin" />
                            ) : (
                                <MoreVertical className="w-4 h-4 mx-auto" />
                            )}
                        </button>

                        {isOpen && (
                            <div className="absolute right-0 top-8 w-48 bg-white border border-uecg-line shadow-2xl z-20 flex flex-col text-left animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-3 py-2 border-b border-uecg-line bg-gray-50 flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                                        Revisión RUDE
                                    </span>
                                    {req.rudeCode && (
                                        <span className="text-[8px] bg-green-100 text-green-700 px-1 font-bold rounded-sm border border-green-200">
                                            CON SIE
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleAction(onPrint, req.id)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors text-uecg-text w-full text-left disabled:opacity-50"
                                >
                                    <Printer className="w-3.5 h-3.5" /> Imprimir RUDE
                                </button>
                                <button
                                    onClick={() => handleAction(onApprove, req)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-dark hover:bg-uecg-blue transition-colors border-t border-uecg-line w-full text-left disabled:opacity-50"
                                >
                                    <Check className="w-3.5 h-3.5" /> Aprobar
                                </button>
                                <button
                                    onClick={() => handleAction(onReject, req.id)}
                                    disabled={generatingPdfId !== null}
                                    className="flex items-center gap-2.5 px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest text-red-600 hover:bg-red-600 hover:text-white transition-colors border-t border-uecg-line w-full text-left disabled:opacity-50"
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
    canManage: boolean; // 🔥 Propiedad ABAC recibida
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
                <thead>
                    <tr className="bg-gray-50 border-b border-uecg-line">
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
                            Estudiante Solicitante
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line">
                            Tipo Inscripción
                        </th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray border-r border-uecg-line text-center">
                            Fecha Solicitud
                        </th>
                        {canManage && (
                            <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-uecg-gray text-center w-20">
                                Acción
                            </th>
                        )}
                    </tr>
                </thead>
                <tbody>
                    {isPending ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <tr key={`skeleton-${i}`} className="border-b border-uecg-line animate-pulse">
                                <td className="px-4 py-4 border-r border-uecg-line flex items-center gap-4">
                                    <div className="w-10 h-10 bg-gray-200 shrink-0" />
                                    <div className="flex flex-col gap-2">
                                        <div className="h-3 w-40 bg-gray-200" />
                                        <div className="h-2 w-20 bg-gray-100" />
                                    </div>
                                </td>
                                <td className="px-4 py-4 border-r border-uecg-line">
                                    <div className="h-5 w-20 bg-gray-200" />
                                </td>
                                <td className="px-4 py-4 border-r border-uecg-line">
                                    <div className="h-3 w-24 bg-gray-100 mx-auto" />
                                </td>
                                {canManage && (
                                    <td className="px-4 py-4">
                                        <div className="h-4 w-4 bg-gray-200 mx-auto" />
                                    </td>
                                )}
                            </tr>
                        ))
                    ) : enrollments.length === 0 ? (
                        <tr>
                            <td colSpan={columnCount} className="p-0">
                                <SwissEmptyState
                                    title="Bandeja Vacía"
                                    description="No hay solicitudes pendientes de revisión."
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