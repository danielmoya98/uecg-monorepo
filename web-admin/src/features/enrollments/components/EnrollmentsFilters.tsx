

import { useState, useRef, useEffect } from "react";
import { Search, X, Filter, ChevronDown, LayoutGrid, List } from "lucide-react";

// ==========================================
// COMPONENTE VISUAL: Combobox Suizo Reutilizable
// ==========================================
interface Option {
    id: string;
    label: string;
}

interface SwissSelectProps {
    value: string;
    onChange: (val: string) => void;
    options: Option[];
    placeholder: string;
}

const SwissSelect = ({ value, onChange, options, placeholder }: SwissSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.id === value);
    const displayLabel = selectedOption ? selectedOption.label : placeholder;
    const isActive = value !== "Todos" && value !== "";

    return (
        <div className="relative min-w-[240px] flex-1 md:flex-none" ref={ref}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-full flex items-center justify-between border bg-white px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-colors shadow-sm focus:outline-none ${
                    isActive
                        ? "border-uecg-blue text-uecg-blue bg-blue-50/10"
                        : "border-uecg-line text-uecg-text hover:border-gray-400"
                }`}
            >
                <div className="flex items-center gap-2">
                    <Filter className={`w-3.5 h-3.5 ${isActive ? "text-uecg-blue" : "text-uecg-gray"}`} />
                    <span className="truncate">{displayLabel}</span>
                </div>
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180 text-uecg-blue" : "text-uecg-gray"}`}
                />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-uecg-line shadow-xl z-30 animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="flex flex-col max-h-60 overflow-y-auto custom-scrollbar">
                        {options.map((opt) => (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    onChange(opt.id);
                                    setIsOpen(false);
                                }}
                                className={`text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                    value === opt.id
                                        ? "bg-uecg-blue text-white"
                                        : "text-uecg-gray hover:bg-gray-50 hover:text-uecg-dark"
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================
interface EnrollmentsFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    filterType: string;
    onFilterTypeChange: (value: string) => void;
    // 🔥 NUEVAS PROPS:
    viewMode: "table" | "grid";
    onViewModeChange: (mode: "table" | "grid") => void;
}

export default function EnrollmentsFilters({
    searchTerm,
    onSearchChange,
    filterType,
    onFilterTypeChange,
    viewMode,
    onViewModeChange,
}: EnrollmentsFiltersProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    // ATAJO DE TECLADO (CTRL+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, []);

    const types = [
        { id: "Todos", label: "TODAS LAS SOLICITUDES" },
        { id: "NUEVO", label: "NUEVOS" },
        { id: "ANTIGUO", label: "ANTIGUOS" },
        { id: "TRASPASO", label: "TRASPASOS" },
    ];

    return (
        <div className="flex flex-col md:flex-row gap-4">
            {/* 🔥 BUSCADOR Y TOGGLE JUNTOS */}
            <div className="flex flex-1 gap-2">
                <div className="relative flex-1 group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-uecg-gray group-focus-within:text-uecg-blue transition-colors" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="BUSCAR ESTUDIANTE POR NOMBRE O CI..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full h-full border border-uecg-line bg-white pl-11 pr-12 py-3 text-uecg-text focus:border-uecg-blue focus:outline-none uppercase text-[11px] font-bold tracking-widest placeholder:text-gray-400 transition-colors shadow-sm"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                        {searchTerm && (
                            <button
                                onClick={() => onSearchChange("")}
                                className="text-gray-400 hover:text-red-500 focus:outline-none p-1"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* BOTÓN TOGGLE */}
                <div className="flex border border-uecg-line bg-white shadow-sm shrink-0">
                    <button
                        onClick={() => onViewModeChange("table")}
                        className={`px-4 py-3 flex items-center justify-center transition-colors ${
                            viewMode === "table"
                                ? "bg-uecg-dark text-white shadow-inner"
                                : "text-uecg-gray hover:text-uecg-dark hover:bg-gray-50"
                        }`}
                        title="Vista de Lista"
                    >
                        <List className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onViewModeChange("grid")}
                        className={`px-4 py-3 flex items-center justify-center transition-colors border-l border-uecg-line ${
                            viewMode === "grid"
                                ? "bg-uecg-dark text-white shadow-inner border-transparent"
                                : "text-uecg-gray hover:text-uecg-dark hover:bg-gray-50"
                        }`}
                        title="Vista de Cuadrícula"
                    >
                        <LayoutGrid className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                <SwissSelect
                    value={filterType}
                    onChange={onFilterTypeChange}
                    options={types}
                    placeholder="Todas las solicitudes"
                />
            </div>
        </div>
    );
}
