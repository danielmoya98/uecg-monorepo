import { useState, useRef } from "react";
import { FileSpreadsheet, Upload, Trash2, Eye, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";


interface ImportDropzoneProps {
  file: File | null;
  previewData: any[];
  uploadResult: any | null;
  onFileUpload: (file: File) => void;
  onOpenPreview: () => void;
  onReset: () => void;
}

export const ImportDropzone = ({
  file,
  previewData,
  uploadResult,
  onFileUpload,
  onOpenPreview,
  onReset,
}: ImportDropzoneProps) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Formatear tamaño del archivo
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // RENDER: REPORTES DE IMPORTACIÓN COMPLETADA
  if (uploadResult) {
    return (
      <div className="w-full border border-uecg-line bg-white p-8 shadow-sm flex flex-col gap-6 animate-in fade-in duration-300">
        <div className="flex items-center gap-4 border-b border-uecg-line pb-4">
          <div className="w-12 h-12 bg-green-150 text-green-700 flex items-center justify-center shadow-inner shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-widest text-green-700">Migración Lote</span>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-uecg-dark">Reporte de Operación</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Métricas */}
          <div className="flex flex-col gap-4 bg-gray-50 p-5 border border-uecg-line">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">Resumen de Registro</h3>
            <div className="flex items-center gap-8 justify-around py-4">
              <div className="text-center">
                <span className="text-4xl font-black text-green-700 tracking-tight">{uploadResult.successCount}</span>
                <p className="text-[8px] font-black uppercase text-uecg-gray tracking-widest mt-1">Éxitos Registrados</p>
              </div>
              <div className="text-center">
                <span className="text-4xl font-black text-red-600 tracking-tight">{uploadResult.failedCount}</span>
                <p className="text-[8px] font-black uppercase text-uecg-gray tracking-widest mt-1">Bajas / Omitidos</p>
              </div>
            </div>
          </div>

          {/* Listado de alumnos procesados */}
          <div className="flex flex-col gap-3 bg-gray-50 p-5 border border-uecg-line">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">Estudiantes Registrados</h3>
            <div className="max-h-36 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 pr-2">
              {uploadResult.insertedStudents && uploadResult.insertedStudents.length > 0 ? (
                uploadResult.insertedStudents.map((sName: string, i: number) => (
                  <p key={`inserted-${i}`} className="text-[9px] font-bold text-uecg-dark uppercase tracking-wider bg-white p-2 border border-uecg-line shadow-sm flex items-center gap-2">
                    <span className="w-4 h-4 bg-uecg-blue text-white flex items-center justify-center text-[7px] font-black">{i + 1}</span>
                    {sName}
                  </p>
                ))
              ) : (
                <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest text-center py-4">
                  Ninguno insertado
                </p>
              )}
            </div>
          </div>
        </div>

        {uploadResult.errors && uploadResult.errors.length > 0 && (
          <div className="border border-red-200 bg-red-50 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-black uppercase text-red-700 tracking-tight block">Advertencias del Motor Excel</span>
              <ul className="list-disc pl-4 mt-2 space-y-1.5 text-[9px] font-bold text-uecg-gray uppercase tracking-wider">
                {uploadResult.errors.map((err: string, i: number) => (
                  <li key={`err-${i}`}>{err}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <button
          onClick={onReset}
          className="mx-auto px-6 py-3 bg-uecg-dark text-white font-black text-[10px] uppercase tracking-widest hover:bg-black transition-colors outline-none shadow-sm cursor-pointer border border-uecg-dark"
        >
          Subir Otro Archivo
        </button>
      </div>
    );
  }

  return (
    <div className="lg:col-span-7 flex flex-col justify-between border border-uecg-line bg-white p-6 shadow-sm min-h-[400px]">
      <h2 className="text-xs font-black uppercase tracking-widest text-uecg-blue border-b border-uecg-line pb-2 flex items-center gap-2 mb-6">
        <span className="bg-uecg-blue text-white px-2 py-0.5 text-[10px]">III</span> Cargador de Archivos
      </h2>

      {!file ? (
        // Dropzone interactivo
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex-1 border-2 border-dashed flex flex-col items-center justify-center p-10 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? "border-uecg-blue bg-blue-50/10 shadow-inner"
              : "border-uecg-line hover:border-uecg-blue hover:bg-gray-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-16 h-16 bg-gray-50 border border-uecg-line flex items-center justify-center shadow-inner rounded-none rotate-45 mb-6 group-hover:scale-105 transition-transform duration-300">
            <Upload className="w-6 h-6 text-uecg-gray -rotate-45" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-uecg-dark">Cargar Archivo Excel / CSV</h3>
          <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mt-2 max-w-[280px] mx-auto">
            Arrastre la hoja de cálculo aquí o haga clic para explorar sus archivos locales.
          </p>
          <span className="text-[8px] font-black text-uecg-blue uppercase tracking-widest mt-4 bg-blue-50 px-2 py-0.5 border border-blue-100 shadow-sm">
            Soportados: .XLSX, .XLS, .CSV
          </span>
        </div>
      ) : (
        // Archivo Cargado
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full gap-6">
          <div className="border border-uecg-line bg-gray-50/50 p-5 flex items-start gap-4 shadow-sm relative group animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 bg-green-100 text-green-700 flex items-center justify-center shadow-inner shrink-0 rotate-12">
              <FileSpreadsheet className="w-6 h-6 -rotate-12" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[8px] font-black uppercase text-green-700 tracking-widest">Excel Listo</span>
              <p className="text-xs font-black uppercase text-uecg-dark mt-0.5 truncate pr-6" title={file.name}>
                {file.name}
              </p>
              <p className="text-[9px] font-bold text-uecg-gray uppercase tracking-widest mt-0.5">
                {formatBytes(file.size)} • {previewData.length} Estudiantes detectados
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors p-1"
              title="Remover Archivo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={onReset}
              className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white hover:bg-gray-100 text-uecg-gray transition-colors shadow-sm outline-none cursor-pointer"
            >
              Remover
            </button>
            <button
              onClick={onOpenPreview}
              className="flex-[2] py-3 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-blue hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-sm outline-none cursor-pointer border border-transparent"
            >
              <Eye className="w-4 h-4" /> Previsualizar Carga <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ImportDropzone;
