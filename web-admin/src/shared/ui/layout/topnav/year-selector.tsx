import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { AcademicYearsService } from "../../../../features/academic-years/api/academic-years.service";
import { useAppStore } from "../../../store/use-app-store"; // Tu Zustand Global

export default function YearSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { selectedYear, setSelectedYear } = useAppStore();

  const { data: currentYear } = useQuery({
    queryKey: ["currentAcademicYear"],
    queryFn: AcademicYearsService.getCurrent,
    staleTime: 5 * 60 * 1000,
  });

  const { data: allYearsData, isLoading } = useQuery({
    queryKey: ["academicYears_topnav"],
    queryFn: () => AcademicYearsService.getAll(1, 20, ""),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (currentYear?.year !== undefined && !selectedYear) {
      setSelectedYear(currentYear.year.toString(), currentYear.id);
    }
  }, [currentYear, selectedYear, setSelectedYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const availableYearsList = allYearsData?.data || [];

  return (
    <div className="relative hidden md:block" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex flex-col text-right focus:outline-none group px-2 cursor-pointer"
      >
        <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray mb-0.5">
          Gestión Escolar
        </span>
        <div className="flex items-center justify-end gap-1 text-uecg-blue transition-colors">
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-black text-base leading-none tracking-tight">{selectedYear || "..."}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-3 w-48 border border-uecg-line bg-white shadow-2xl z-50">
          <div className="p-3 border-b border-uecg-line bg-gray-50">
            <p className="text-[9px] uppercase tracking-widest text-uecg-gray font-bold">Cambiar Gestión</p>
          </div>
          <div className="flex flex-col max-h-48 overflow-y-auto custom-scrollbar">
            {isLoading ? (
              <div className="p-4 flex justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-uecg-blue" />
              </div>
            ) : (
              availableYearsList.map((yearObj: any) => (
                <button
                  key={yearObj.id}
                  onClick={() => {
                    setSelectedYear(yearObj.year.toString(), yearObj.id);
                    setIsOpen(false);
                  }}
                  className={`px-4 py-2.5 flex items-center justify-between text-left transition-colors border-l-4 cursor-pointer ${selectedYear === yearObj.year.toString()
                    ? "border-uecg-blue bg-blue-50 text-uecg-blue"
                    : "border-transparent text-uecg-text hover:bg-gray-50 hover:border-uecg-line"
                    }`}
                >
                  <span className="text-xs font-black tracking-tight">{yearObj.year}</span>
                  {yearObj.status === "ACTIVE" && (
                    <span className="text-[8px] bg-uecg-blue text-white px-1.5 py-0.5 uppercase font-bold tracking-widest">
                      Activa
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
