import { Users, GraduationCap, Library, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { GlobalStats } from "../types/dashboard.types";

interface GlobalMetricsWidgetProps {
  stats: GlobalStats | undefined;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 350, damping: 32 } },
};

export default function GlobalMetricsWidget({ stats, isLoading }: GlobalMetricsWidgetProps) {
  return (
    <section 
      aria-labelledby="global-metrics-title"
      className="flex flex-col gap-6 transition-all duration-500"
    >
      <div className="flex justify-between items-end border-b border-uecg-line pb-2 mt-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-gray">Resumen Global</span>
          <h2 id="global-metrics-title" className="text-2xl mt-1 font-black tracking-tighter uppercase text-uecg-text">
            Estado del Colegio
          </h2>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border border-uecg-line bg-white"
      >
        {/* Estudiantes */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="students-label"
        >
          <div className="flex justify-between items-start">
            <span id="students-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Estudiantes<br />Matriculados
            </span>
            <Users className="text-uecg-blue w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-uecg-gray" aria-hidden="true" />
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-blue tracking-tighter block leading-none">
                  {stats?.students ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Gestión Activa
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Docentes */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="teachers-label"
        >
          <div className="flex justify-between items-start">
            <span id="teachers-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Plantel<br />Docente
            </span>
            <GraduationCap className="text-uecg-blue w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-uecg-gray" aria-hidden="true" />
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-blue tracking-tighter block leading-none">
                  {stats?.teachers ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Cuentas Activas
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Cursos Habilitados */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b md:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="classrooms-label"
        >
          <div className="flex justify-between items-start">
            <span id="classrooms-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Cursos<br />Habilitados
            </span>
            <Library className="text-uecg-blue w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-uecg-gray" aria-hidden="true" />
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-text tracking-tighter block leading-none">
                  {stats?.classrooms ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Gestión Regular
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Conexión (RUE Sync) */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col bg-uecg-dark text-white group relative overflow-hidden h-36 p-5"
          role="region"
          aria-labelledby="sync-label"
        >
          <span id="sync-label" className="text-[9px] font-black uppercase tracking-widest text-white/50 relative z-10">
            Conexión Institucional
          </span>
          <div className="mt-auto relative z-10" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-white/50" aria-hidden="true" />
            ) : (
              <>
                <span className="text-2xl font-black text-[#00FF88] uppercase tracking-tighter block leading-none">
                  Sincronizado
                </span>
                <p className="text-[8px] uppercase tracking-widest mt-1 text-white/50">
                  Última Act.: {stats?.lastSync || "Desconocido"}
                </p>
              </>
            )}
          </div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-5 rotate-45 transform group-hover:rotate-90 transition-transform duration-700 ease-out" aria-hidden="true" />
        </motion.div>
      </motion.div>
    </section>
  );
}
