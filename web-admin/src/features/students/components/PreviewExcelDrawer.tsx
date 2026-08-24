import { Loader2, FileCheck2, AlertTriangle, Play } from "lucide-react";
import { DrawerShell } from "@/shared/ui/drawer-shell";

interface PreviewExcelDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: any[];
  isUploading: boolean;
  onConfirm: () => void;
  selectedClassroomId: string;
}

export default function PreviewExcelDrawer({
  isOpen,
  onClose,
  previewData,
  isUploading,
  onConfirm,
  selectedClassroomId,
}: PreviewExcelDrawerProps) {
  const isBlockActive = !selectedClassroomId;

  return (
    <DrawerShell
      isOpen={isOpen}
      onClose={onClose}
      title="Previsualizador de Carga"
      kicker="Revisión de Estructura"
      icon={<FileCheck2 className="w-5 h-5 text-white" />}
      headerVariant="dark"
      isSubmitting={isUploading}
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Cuerpo */}
        <div className="flex-1 p-6 overflow-hidden bg-gray-50 dark:bg-zinc-900/50 flex flex-col gap-6 relative">
          {/* Bloqueador de Validación */}
          {isBlockActive && (
            <div className="absolute inset-0 bg-white/95 dark:bg-zinc-900/95 z-30 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/40 rounded-none flex items-center justify-center mb-5 rotate-12">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400 -rotate-12" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-uecg-dark dark:text-zinc-100 mb-2">
                Falta Asignar Curso Destino
              </h3>
              <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest leading-relaxed mb-6 max-w-[280px]">
                Debe buscar y seleccionar un curso paralelo en el panel de migración del lateral izquierdo antes de poder previsualizar e importar la lista.
              </p>
              <button
                onClick={onClose}
                className="px-5 py-3 bg-uecg-dark text-white text-[10px] font-black uppercase tracking-widest hover:bg-black transition-colors shadow-sm outline-none cursor-pointer"
              >
                Volver a Configurar
              </button>
            </div>
          )}

          {/* Tabla de previsualización */}
          <div className="flex flex-col gap-3 flex-1 overflow-hidden bg-white dark:bg-zinc-900 border border-uecg-line shadow-sm">
            <div className="px-4 py-3 border-b border-uecg-line bg-gray-50 dark:bg-zinc-900/80 flex items-center justify-between shrink-0">
              <span className="text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                Registros Detectados en Hoja ({previewData.length})
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-zinc-900 border-b border-uecg-line text-[9px] font-black uppercase tracking-widest text-uecg-gray">
                    <th className="px-3 py-2 border-r border-uecg-line">Nombres completo</th>
                    <th className="px-3 py-2 border-r border-uecg-line text-center w-24">C.I.</th>
                    <th className="px-3 py-2 border-r border-uecg-line text-center w-24">Género</th>
                    <th className="px-3 py-2 text-center w-24">Nacimiento</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-uecg-line">
                  {previewData.map((row, i) => (
                    <tr key={`row-${i}`} className="text-[10px] font-bold uppercase tracking-wider text-uecg-dark dark:text-zinc-100 hover:bg-gray-50/50 dark:hover:bg-zinc-800/50">
                      <td className="px-3 py-2.5 border-r border-uecg-line">
                        {row.lastNamePaterno} {row.lastNameMaterno} {row.names}
                      </td>
                      <td className="px-3 py-2.5 border-r border-uecg-line text-center">
                        {row.ci}
                      </td>
                      <td className="px-3 py-2.5 border-r border-uecg-line text-center text-[9px]">
                        <span className={`px-1.5 py-0.5 border ${row.gender === 'MASCULINO' ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-900' : 'bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-100 dark:border-pink-900'}`}>
                          {row.gender.substring(0, 3)}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center text-[9px] text-uecg-gray">
                        {row.birthDate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-5 border-t border-uecg-line bg-gray-50 dark:bg-zinc-900 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest border border-uecg-line bg-white dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 text-uecg-gray dark:text-zinc-200 transition-colors shadow-sm outline-none cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isUploading || isBlockActive}
            className="flex-[2] py-3 text-[10px] font-black uppercase tracking-widest text-white bg-uecg-blue hover:bg-blue-700 transition-colors flex justify-center items-center gap-2 shadow-sm outline-none cursor-pointer border border-transparent disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Ejecutar Importación
              </>
            )}
          </button>
        </footer>
      </div>
    </DrawerShell>
  );
}
