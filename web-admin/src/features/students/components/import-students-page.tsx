import { useState } from "react";
import { ChevronLeft, FileSpreadsheet, HelpCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";

// Hooks
import { useImportConfig } from "../hooks/use-import-config";
import { useExcelEngine } from "../hooks/use-excel-engine";

// Componentes
import { ImportConfigPanel } from "./ImportConfigPanel";
import { ImportDropzone } from "./ImportDropzone";

// Modales
import ImportGuideDrawer from "./ImportGuideDrawer";
import PreviewExcelDrawer from "./PreviewExcelDrawer";

export default function ImportStudentsPage() {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // 1. Inyección de Configuración Previa
  const {
    currentYear,
    globalStatus,
    setGlobalStatus,
    selectedClassroomId,
    setSelectedClassroomId,
    courseSearch,
    setCourseSearch,
    selectedClassroomData,
    filteredClassrooms,
  } = useImportConfig();

  // 2. Inyección del Motor de Carga Excel
  const {
    file,
    previewData,
    isPreviewDrawerOpen,
    setIsPreviewDrawerOpen,
    isUploading,
    uploadResult,
    handleFileUpload,
    executeImport,
    downloadTemplate,
    resetUpload,
  } = useExcelEngine({
    currentYearId: currentYear?.id,
    selectedClassroomId,
    globalStatus,
  });

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)]">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4">
        <div>
          <Link
            to="/students"
            className="text-[10px] font-black text-uecg-gray uppercase tracking-widest hover:text-uecg-blue flex items-center gap-1 w-max transition-colors mb-2 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Volver a Población
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
            <FileSpreadsheet className="w-8 h-8 text-uecg-blue" /> Migración por Curso
          </h1>
        </div>
        <button
          onClick={() => setIsTutorialOpen(true)}
          className="flex items-center gap-2 px-4 py-3 bg-white text-uecg-dark border border-uecg-line font-black text-[10px] uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-colors outline-none shadow-sm cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" /> ¿Cómo funciona esto?
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      {uploadResult ? (
        // Reporte de importación a pantalla completa
        <ImportDropzone
          file={file}
          previewData={previewData}
          uploadResult={uploadResult}
          onFileUpload={handleFileUpload}
          onOpenPreview={() => setIsPreviewDrawerOpen(true)}
          onReset={resetUpload}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Configuración */}
          <ImportConfigPanel
            globalStatus={globalStatus}
            setGlobalStatus={setGlobalStatus}
            selectedClassroomId={selectedClassroomId}
            setSelectedClassroomId={setSelectedClassroomId}
            courseSearch={courseSearch}
            setCourseSearch={setCourseSearch}
            selectedClassroomData={selectedClassroomData}
            filteredClassrooms={filteredClassrooms}
            onDownloadTemplate={downloadTemplate}
          />

          {/* Carga Dropzone */}
          <ImportDropzone
            file={file}
            previewData={previewData}
            uploadResult={uploadResult}
            onFileUpload={handleFileUpload}
            onOpenPreview={() => setIsPreviewDrawerOpen(true)}
            onReset={resetUpload}
          />
        </div>
      )}

      {/* DIÁLOGOS DE APOYO (PORTALES) */}
      <ImportGuideDrawer isOpen={isTutorialOpen} onClose={() => setIsTutorialOpen(false)} />

      <PreviewExcelDrawer
        isOpen={isPreviewDrawerOpen}
        onClose={() => setIsPreviewDrawerOpen(false)}
        previewData={previewData}
        isUploading={isUploading}
        onConfirm={executeImport}
        selectedClassroomId={selectedClassroomId}
      />
    </div>
  );
}
