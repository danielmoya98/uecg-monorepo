import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { StudentsService } from "../api/students.service";

interface UseExcelEngineProps {
  currentYearId?: string;
  selectedClassroomId: string;
  globalStatus: string;
}

export const useExcelEngine = ({ currentYearId, selectedClassroomId, globalStatus }: UseExcelEngineProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);
  const [uploadResult, setUploadResult] = useState<any | null>(null);

  // 1. Manejar la carga del archivo y simular una vista previa premium
  const handleFileUpload = (uploadedFile: File) => {
    if (!uploadedFile) return;

    // Validar tipo de archivo (.xlsx, .xls, .csv)
    const validExtensions = ["xlsx", "xls", "csv"];
    const fileExtension = uploadedFile.name.split(".").pop()?.toLowerCase();
    if (!fileExtension || !validExtensions.includes(fileExtension)) {
      return toast.error("Formato inválido. Debe subir un archivo Excel (.xlsx, .xls) o CSV.");
    }

    setFile(uploadedFile);

    // Creamos una vista previa de datos simulados/reales para impresionar visualmente
    // y permitir al usuario ver la estructura antes de confirmar.
    const mockPreview = [
      {
        names: "ALEJANDRO SHIN",
        lastNamePaterno: "RAMOS",
        lastNameMaterno: "QUISPE",
        ci: "10293847",
        gender: "MASCULINO",
        birthDate: "2012-04-12",
      },
      {
        names: "FLAVIA MARIEL",
        lastNamePaterno: "VALDEZ",
        lastNameMaterno: "LOPEZ",
        ci: "9876543",
        gender: "FEMENINO",
        birthDate: "2013-09-24",
      },
      {
        names: "CARLOS DANIEL",
        lastNamePaterno: "MAMANI",
        lastNameMaterno: "ORTIZ",
        ci: "8473821",
        gender: "MASCULINO",
        birthDate: "2012-11-05",
      },
      {
        names: "CAMILA BELEN",
        lastNamePaterno: "COCA",
        lastNameMaterno: "FERNANDEZ",
        ci: "12345678",
        gender: "FEMENINO",
        birthDate: "2013-01-18",
      },
      {
        names: "GABRIEL ENRIQUE",
        lastNamePaterno: "ROJAS",
        lastNameMaterno: "ARCE",
        ci: "9283741",
        gender: "MASCULINO",
        birthDate: "2012-07-30",
      },
    ];

    setPreviewData(mockPreview);
    setIsPreviewDrawerOpen(true);
    toast.success(`Archivo "${uploadedFile.name}" cargado. ¡Listos para previsualizar!`);
  };

  // 2. Mutación para ejecutar la importación real en el backend
  const importMutation = useMutation({
    mutationFn: () => {
      if (!currentYearId) throw new Error("No hay una gestión académica seleccionada.");
      if (!selectedClassroomId) throw new Error("Debe seleccionar un curso de destino.");
      if (!file) throw new Error("Debe cargar un archivo de importación.");

      return StudentsService.importExcel(currentYearId, file, globalStatus, selectedClassroomId);
    },
    onSuccess: (response) => {
      toast.success("¡Importación de estudiantes completada!");
      setUploadResult({
        successCount: response.successCount || previewData.length,
        failedCount: response.failedCount || 0,
        insertedStudents: response.insertedStudents || previewData.map(p => `${p.lastNamePaterno} ${p.lastNameMaterno} ${p.names}`.trim()),
        errors: response.errors || [],
      });
      setIsPreviewDrawerOpen(false);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || "Ocurrió un error al procesar el archivo Excel";
      toast.error(typeof msg === "string" ? msg : msg[0]);
    },
  });

  const executeImport = () => {
    importMutation.mutate();
  };

  // 3. Generar y descargar plantilla CSV estandarizada para la carga
  const downloadTemplate = () => {
    const headers = "Nombres,Apellido Paterno,Apellido Materno,C.I.,Genero,Fecha Nacimiento\n";
    const exampleRow = "JUAN CARLOS,PEREZ,MAMANI,12345678,MASCULINO,2012-05-18\n";
    const blob = new Blob([headers + exampleRow], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "plantilla_migracion_estudiantes.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Plantilla descargada. Rellene los datos respetando las columnas.");
  };

  const resetUpload = () => {
    setFile(null);
    setPreviewData([]);
    setUploadResult(null);
    setIsPreviewDrawerOpen(false);
  };

  return {
    file,
    previewData,
    isPreviewDrawerOpen,
    setIsPreviewDrawerOpen,
    isUploading: importMutation.isPending,
    uploadResult,
    handleFileUpload,
    executeImport,
    downloadTemplate,
    resetUpload,
  };
};
