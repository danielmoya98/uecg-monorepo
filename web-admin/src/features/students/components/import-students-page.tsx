import { useState } from "react";
import { FileSpreadsheet, HelpCircle } from "lucide-react";
import { PageHeader, PageHeaderButton } from "@/shared/ui";


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
    <div className="flex flex-col gap-6 w-full relative animate-in fade-in duration-300 min-h-[calc(100vh-140px)]">
      {/* HEADER SUIZO CON BREADCRUMBS */}
      <PageHeader
        breadcrumbs={[
          { label: 'ADMINISTRACIÓN' },
          { label: 'POBLACIÓN ESTUDIANTIL', href: '/students' },
          { label: 'MIGRACIÓN EXCEL', icon: FileSpreadsheet },
        ]}
        title="Migración por Curso"
        description="Carga masiva de nómina y asignación de RUDE mediante planillas estandarizadas."
      >
        <PageHeaderButton
          onClick={() => setIsTutorialOpen(true)}
          icon={HelpCircle}
          variant="secondary"
          hotkey="?"
        >
          ¿Cómo funciona esto?
        </PageHeaderButton>
      </PageHeader>


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
