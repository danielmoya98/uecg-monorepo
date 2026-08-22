import { Users, HelpCircle, Download } from "lucide-react";

interface ImportConfigPanelProps {
  globalStatus: string;
  setGlobalStatus: (status: string) => void;
  selectedClassroomId: string;
  setSelectedClassroomId: (id: string) => void;
  courseSearch: string;
  setCourseSearch: (query: string) => void;
  selectedClassroomData: any;
  filteredClassrooms: any[];
  onDownloadTemplate: () => void;
}

export const ImportConfigPanel = ({
  globalStatus,
  setGlobalStatus,
  selectedClassroomId,
  setSelectedClassroomId,
  courseSearch,
  setCourseSearch,
  selectedClassroomData,
  filteredClassrooms,
  onDownloadTemplate,
}: ImportConfigPanelProps) => {
  return (
    <div className="lg:col-span-5 flex flex-col gap-6">
      {/* Paso 1: Configurar Estado e Instrucción */}
      <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
          <span className="bg-uecg-blue text-white px-2 py-0.5 text-[10px]">I</span> Estado de Importación
        </h2>
        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed">
          Defina el estado inicial con el que ingresarán los estudiantes matriculados en este lote:
        </p>
        <div className="flex gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 border border-uecg-line p-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="REVISION_SIE"
              checked={globalStatus === "REVISION_SIE"}
              onChange={() => setGlobalStatus("REVISION_SIE")}
              className="w-4 h-4 text-uecg-blue focus:ring-0"
            />
            Revisión SIE
          </label>
          <label className="flex-1 flex items-center justify-center gap-2 border border-uecg-line p-3 cursor-pointer text-[10px] font-bold uppercase tracking-widest hover:bg-gray-50 transition-colors">
            <input
              type="radio"
              value="INSCRITO"
              checked={globalStatus === "INSCRITO"}
              onChange={() => setGlobalStatus("INSCRITO")}
              className="w-4 h-4 text-uecg-blue focus:ring-0"
            />
            Inscrito Oficial
          </label>
        </div>
      </div>

      {/* Paso 2: Seleccionar Curso de Destino */}
      <div className="border border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2">
          <span className="bg-uecg-blue text-white px-2 py-0.5 text-[10px]">II</span> Curso de Destino
        </h2>
        
        {/* Buscador de Cursos */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
            Buscar Curso / Paralelo
          </label>
          <input
            type="text"
            placeholder="EJ: PRIMARIA 3..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full border border-uecg-line bg-white p-3 uppercase outline-none text-xs font-bold focus:border-uecg-blue transition-colors placeholder:text-gray-300"
          />
        </div>

        {/* Listado de cursos filtrados */}
        <div className="flex flex-col gap-1.5 mt-2">
          <label className="text-[9px] font-black uppercase text-uecg-gray tracking-widest">
            Seleccionar Curso ({filteredClassrooms.length})
          </label>
          <div className="border border-uecg-line max-h-48 overflow-y-auto custom-scrollbar bg-gray-50 flex flex-col">
            {filteredClassrooms.length === 0 ? (
              <p className="p-4 text-[10px] font-bold text-uecg-gray uppercase tracking-widest text-center">
                No se encontraron cursos
              </p>
            ) : (
              filteredClassrooms.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedClassroomId(c.id)}
                  className={`text-left px-4 py-3 border-b border-uecg-line last:border-0 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-between cursor-pointer ${
                    selectedClassroomId === c.id
                      ? "bg-uecg-blue text-white"
                      : "text-uecg-gray hover:bg-gray-100 hover:text-uecg-dark"
                  }`}
                >
                  <span>{c.level} - {c.grade} "{c.section}"</span>
                  <span className="text-[8px] bg-black/10 px-1 py-0.5 rounded-sm">Turno {c.shift}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Resumen del curso seleccionado */}
        {selectedClassroomData && (
          <div className="mt-4 p-4 border border-blue-200 bg-blue-50/50 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Users className="w-5 h-5 text-uecg-blue shrink-0 mt-0.5" />
            <div>
              <span className="text-[8px] font-black uppercase text-uecg-blue tracking-widest block">Seleccionado</span>
              <p className="text-xs font-black uppercase text-uecg-dark mt-0.5">
                {selectedClassroomData.grade} "{selectedClassroomData.section}" ({selectedClassroomData.level})
              </p>
              <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
                Turno {selectedClassroomData.shift} • Aula Asignada
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Descarga de Plantilla */}
      <div className="border border-dashed border-uecg-line bg-white p-6 shadow-sm flex flex-col gap-4 text-center">
        <div className="w-10 h-10 bg-gray-50 border border-uecg-line mx-auto flex items-center justify-center rotate-45">
          <HelpCircle className="w-5 h-5 text-uecg-gray -rotate-45" />
        </div>
        <div>
          <h4 className="text-[11px] font-black uppercase tracking-widest text-uecg-dark">¿No tiene la plantilla RUDE?</h4>
          <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mt-1">
            Descargue la hoja de cálculo patrón con las columnas y formatos correctos requeridos por el motor de importación.
          </p>
        </div>
        <button
          onClick={onDownloadTemplate}
          className="mx-auto flex items-center gap-2 px-4 py-3 bg-uecg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors outline-none shadow-sm cursor-pointer"
        >
          <Download className="w-4 h-4" /> Descargar Plantilla .CSV
        </button>
      </div>
    </div>
  );
};
export default ImportConfigPanel;
