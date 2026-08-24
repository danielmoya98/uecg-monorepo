import { useEffect, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, FileArchive, Layers, Users, Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ReportsService } from "../api/reports.service";

export interface DrawerClassroom {
  id: string;
  level: string;
  grade: string;
  section: string;
  shift: string;
}

export interface MassiveBulletinsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  academicYearId: string;
  allowedLevels: string[];
  availableClassrooms: DrawerClassroom[];
  onStartExport?: () => void;
}

export default function MassiveBulletinsDrawer({
  isOpen,
  onClose,
  academicYearId,
  allowedLevels,
  availableClassrooms,
  onStartExport,
}: MassiveBulletinsDrawerProps) {
  const [isClient, setIsClient] = useState(false);
  const [scope, setScope] = useState<"SCHOOL" | "LEVEL" | "CLASSROOM">("SCHOOL");
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Asegura la hidratación correcta y compatibilidad con SSR/Vite
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Reset del formulario cuando se abre/cierra
  useEffect(() => {
    if (isOpen) {
      setScope("SCHOOL");
      setSelectedLevel("");
      setSelectedClassroom("");
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Manejo de atajo del teclado Escape para A11y
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Filtramos los cursos para el selector si eligió "Por Curso" o "Por Nivel"
  const filteredClassrooms = useMemo(() => {
    if (!selectedLevel) return availableClassrooms;
    return availableClassrooms.filter((c) => c.level === selectedLevel);
  }, [availableClassrooms, selectedLevel]);

  // Reset del curso seleccionado si ya no pertenece al nivel elegido
  useEffect(() => {
    if (selectedLevel && selectedClassroom) {
      const exists = availableClassrooms.some(
        (c) => c.id === selectedClassroom && c.level === selectedLevel
      );
      if (!exists) setSelectedClassroom("");
    }
  }, [selectedLevel, availableClassrooms, selectedClassroom]);

  if (!isOpen || !isClient) return null;

  const handleExport = async () => {
    if (scope === "LEVEL" && !selectedLevel) {
      toast.error("Por favor selecciona un nivel.");
      return;
    }
    if (scope === "CLASSROOM" && !selectedClassroom) {
      toast.error("Por favor selecciona un curso.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Encolando exportación de libretas...");

    try {
      const payload: { academicYearId: string; classroomId?: string; level?: string } = {
        academicYearId,
      };

      if (scope === "CLASSROOM") {
        payload.classroomId = selectedClassroom;
      }
      if (scope === "LEVEL") {
        payload.level = selectedLevel;
      }

      await ReportsService.requestMassiveBulletins(payload);

      if (onStartExport) {
        onStartExport();
      }

      toast.success("¡Generación en proceso!", {
        id: toastId,
        description: "Te notificaremos cuando el archivo ZIP esté listo para descargar.",
      });
      onClose();
    } catch (error) {
      console.error("Error al encolar exportación masiva:", error);
      toast.error("Hubo un error al encolar la exportación en el servidor.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const drawerContent = (
    <div
      className="fixed inset-0 z-[9999] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      {/* Backdrop interactivo optimizado para GPU */}
      <div
        className="absolute inset-0 bg-uecg-dark/70 will-change-[opacity] transform-gpu transition-opacity duration-200 cursor-pointer"
        onClick={onClose}
      />

      {/* Panel del Drawer deslizable */}
      <div
        className="relative h-full w-full max-w-md bg-white shadow-2xl flex flex-col z-10 border-l border-uecg-line animate-in slide-in-from-right duration-300 will-change-transform transform-gpu"
      >
        {/* Header */}
        <div className="p-6 border-b border-uecg-line bg-gray-50 flex items-center justify-between shrink-0">
          <div>
            <h2 id="drawer-title" className="text-xl font-black uppercase tracking-tighter text-uecg-dark flex items-center gap-2">
              <FileArchive className="w-5 h-5 text-uecg-blue" /> Exportación Masiva
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-uecg-gray mt-1">
              Libretas Electrónicas (Ley 070)
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-uecg-gray hover:text-red-500 hover:bg-red-50 transition-all rounded-full focus:outline-none cursor-pointer"
            aria-label="Cerrar panel de exportación masiva"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar bg-white">
          {/* Selector de Alcance */}
          <div className="space-y-3">
            <span className="block text-[10px] font-black uppercase tracking-widest text-uecg-gray">
              Alcance de Exportación
            </span>
            <div className="grid grid-cols-1 gap-2">
              {/* Botón Alcance Colegio */}
              <button
                type="button"
                onClick={() => {
                  setScope("SCHOOL");
                  setSelectedLevel("");
                  setSelectedClassroom("");
                }}
                disabled={isSubmitting}
                className={`p-4 border text-left flex items-center gap-4 transition-all focus:outline-none cursor-pointer disabled:opacity-50 ${
                  scope === "SCHOOL"
                    ? "border-uecg-blue bg-blue-50/50"
                    : "border-uecg-line bg-white hover:border-blue-200"
                }`}
              >
                <div
                  className={`p-2 ${
                    scope === "SCHOOL" ? "bg-uecg-blue text-white" : "bg-gray-100 text-uecg-gray"
                  }`}
                >
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-sm font-black uppercase tracking-tighter ${
                      scope === "SCHOOL" ? "text-uecg-blue" : "text-uecg-dark"
                    }`}
                  >
                    Todo el Colegio
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray mt-0.5">
                    Todos los estudiantes inscritos
                  </p>
                </div>
              </button>

              {/* Botón Alcance Nivel */}
              <button
                type="button"
                onClick={() => {
                  setScope("LEVEL");
                  setSelectedClassroom("");
                }}
                disabled={isSubmitting}
                className={`p-4 border text-left flex items-center gap-4 transition-all focus:outline-none cursor-pointer disabled:opacity-50 ${
                  scope === "LEVEL"
                    ? "border-uecg-blue bg-blue-50/50"
                    : "border-uecg-line bg-white hover:border-blue-200"
                }`}
              >
                <div
                  className={`p-2 ${
                    scope === "LEVEL" ? "bg-uecg-blue text-white" : "bg-gray-100 text-uecg-gray"
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-sm font-black uppercase tracking-tighter ${
                      scope === "LEVEL" ? "text-uecg-blue" : "text-uecg-dark"
                    }`}
                  >
                    Por Nivel
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray mt-0.5">
                    Primaria o Secundaria completo
                  </p>
                </div>
              </button>

              {/* Botón Alcance Curso Específico */}
              <button
                type="button"
                onClick={() => setScope("CLASSROOM")}
                disabled={isSubmitting}
                className={`p-4 border text-left flex items-center gap-4 transition-all focus:outline-none cursor-pointer disabled:opacity-50 ${
                  scope === "CLASSROOM"
                    ? "border-uecg-blue bg-blue-50/50"
                    : "border-uecg-line bg-white hover:border-blue-200"
                }`}
              >
                <div
                  className={`p-2 ${
                    scope === "CLASSROOM" ? "bg-uecg-blue text-white" : "bg-gray-100 text-uecg-gray"
                  }`}
                >
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p
                    className={`text-sm font-black uppercase tracking-tighter ${
                      scope === "CLASSROOM" ? "text-uecg-blue" : "text-uecg-dark"
                    }`}
                  >
                    Por Curso Específico
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray mt-0.5">
                    Ej: Tercero A de Secundaria
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Filtros Secundarios condicionados al alcance */}
          {(scope === "LEVEL" || scope === "CLASSROOM") && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="space-y-2">
                <label
                  htmlFor="level-select"
                  className="block text-[10px] font-black uppercase tracking-widest text-uecg-gray"
                >
                  Seleccionar Nivel
                </label>
                <select
                  id="level-select"
                  className="w-full border border-uecg-line bg-gray-50 p-3 text-xs font-bold uppercase tracking-widest text-uecg-dark focus:outline-none focus:border-uecg-blue focus:ring-1 focus:ring-uecg-blue transition-all cursor-pointer disabled:opacity-50"
                  value={selectedLevel}
                  onChange={(e) => {
                    setSelectedLevel(e.target.value);
                    setSelectedClassroom(""); // Resetear curso al cambiar nivel
                  }}
                  disabled={isSubmitting}
                >
                  <option value="">-- Elige un Nivel --</option>
                  {allowedLevels.map((lvl) => (
                    <option key={lvl} value={lvl}>
                      {lvl}
                    </option>
                  ))}
                </select>
              </div>

              {scope === "CLASSROOM" && (
                <div className="space-y-2 animate-in fade-in duration-200">
                  <label
                    htmlFor="classroom-select"
                    className="block text-[10px] font-black uppercase tracking-widest text-uecg-gray"
                  >
                    Seleccionar Curso
                  </label>
                  <select
                    id="classroom-select"
                    className="w-full border border-uecg-line bg-gray-50 p-3 text-xs font-bold uppercase tracking-widest text-uecg-dark focus:outline-none focus:border-uecg-blue focus:ring-1 focus:ring-uecg-blue transition-all disabled:opacity-50 cursor-pointer"
                    value={selectedClassroom}
                    onChange={(e) => setSelectedClassroom(e.target.value)}
                    disabled={!selectedLevel || isSubmitting}
                  >
                    <option value="">-- Elige un Curso --</option>
                    {filteredClassrooms.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.grade} "{c.section}" - {c.shift}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer / Botón Principal de Envío */}
        <div className="p-6 border-t border-uecg-line bg-gray-50 shrink-0">
          <button
            type="button"
            onClick={handleExport}
            disabled={
              isSubmitting ||
              (scope === "LEVEL" && !selectedLevel) ||
              (scope === "CLASSROOM" && !selectedClassroom)
            }
            className="w-full bg-uecg-blue text-white p-4 text-xs font-black uppercase tracking-widest hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-uecg-blue"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileArchive className="w-4 h-4" />
            )}
            {isSubmitting ? "Enviando al Servidor..." : "Generar Archivo ZIP"}
          </button>
          <p className="text-center text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-4 leading-relaxed">
            Este proceso se ejecutará en segundo plano. Recibirá una notificación cuando el archivo ZIP de libretas esté listo.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(drawerContent, document.body);
}
