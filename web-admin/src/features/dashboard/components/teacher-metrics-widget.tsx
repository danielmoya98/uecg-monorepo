import { Link } from "@tanstack/react-router";
import { Clock, ClipboardCheck, ArrowRight, BookOpen, Users } from "lucide-react";
import { motion } from "framer-motion";
import type { TeacherStats } from "../types/dashboard.types";

interface TeacherMetricsWidgetProps {
  stats: TeacherStats | undefined;
  isLoading: boolean;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 350, damping: 32 }
  },
};

export default function TeacherMetricsWidget({ stats, isLoading }: TeacherMetricsWidgetProps) {
  return (
    <section 
      aria-labelledby="teacher-metrics-title"
      className="flex flex-col gap-6 transition-all duration-500"
    >
      <div className="flex justify-between items-end border-b border-uecg-line pb-2 mt-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-uecg-blue">
            Resumen Operativo
          </span>
          <h2 id="teacher-metrics-title" className="text-2xl mt-1 font-black tracking-tighter uppercase text-uecg-text">
            Panel Docente
          </h2>
        </div>
      </div>

      {/* 📊 CONTENEDOR EN CASCADA */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border border-uecg-line bg-white"
      >
        {/* Siguiente Clase */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="next-class-label"
        >
          <div className="flex justify-between items-start">
            <span id="next-class-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Siguiente<br />Clase
            </span>
            <Clock className="text-uecg-blue w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-20 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-28 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-blue tracking-tighter block leading-none">
                  {stats?.nextClassTime || "--:--"}
                </span>
                <span className="text-[8px] font-bold text-uecg-text uppercase tracking-widest mt-1 block flex items-center gap-1 truncate">
                  {stats?.nextSubject || "Sin Asignar"}{" "}
                  <ArrowRight className="w-2.5 h-2.5 text-uecg-gray" aria-hidden="true" />{" "}
                  {stats?.nextGroup || "--"}
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Estudiantes */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="students-charge-label"
        >
          <div className="flex justify-between items-start">
            <span id="students-charge-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Estudiantes<br />A Cargo
            </span>
            <Users className="text-uecg-blue w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-16 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-20 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-blue tracking-tighter block leading-none">
                  {stats?.studentsCount ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Alumnos únicos
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Asistencia */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b md:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="attendance-ctrl-label"
        >
          <div className="flex justify-between items-start">
            <span id="attendance-ctrl-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Control de<br />Asistencia
            </span>
            <ClipboardCheck className={`${stats?.attendanceStatus === "Al día" ? "text-green-600" : "text-yellow-600"} w-4 h-4`} aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-7 w-24 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-16 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className={`text-2xl font-black uppercase tracking-tighter block leading-none ${stats?.attendanceStatus === "Al día" ? "text-green-600" : "text-yellow-600"}`}>
                  {stats?.attendanceStatus || "Sin Datos"}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Estado diario
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Trimestre */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col bg-uecg-dark text-white group relative overflow-hidden h-36 p-5"
          role="region"
          aria-labelledby="trimester-ctrl-label"
        >
          <span id="trimester-ctrl-label" className="text-[9px] font-black uppercase tracking-widest text-white/50 relative z-10">
            Calificaciones
          </span>
          <div className="mt-auto relative z-10" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-7 w-28 bg-white/20 animate-pulse" />
                <div className="h-2.5 w-24 bg-white/10 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className={`text-3xl font-black uppercase block leading-none ${stats?.currentTrimester === "Cerrado" ? "text-red-400" : "text-[#00FF88]"}`}>
                  {stats?.currentTrimester || "Cerrado"}
                </span>
                <p className="text-[8px] uppercase tracking-widest mt-1 text-white/50 flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 ${stats?.currentTrimester !== "Cerrado" ? "bg-[#00FF88] animate-pulse" : "bg-red-400"}`} aria-hidden="true"></span>
                  {stats?.currentTrimester !== "Cerrado" ? "Sistema Abierto" : "Sistema Bloqueado"}
                </p>
              </>
            )}
          </div>
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white opacity-5 rotate-45 transform group-hover:rotate-90 transition-transform duration-700 ease-out" aria-hidden="true"></div>
        </motion.div>
      </motion.div>

      {/* 🚀 ATAJOS RÁPIDOS ANIMADOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
        <Link 
          to="/attendance" 
          className="no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uecg-blue focus-visible:ring-offset-2 focus-visible:z-10 rounded block transition-all"
        >
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.15, ease: "easeOut" } }}
            className="border border-uecg-line bg-white hover:border-uecg-blue transition-colors group flex items-stretch h-28 shadow-sm cursor-pointer"
          >
            <div className="w-3 bg-uecg-blue group-hover:bg-blue-600 transition-colors h-full" />
            <div className="p-5 flex flex-col justify-center flex-1">
              <h3 className="text-lg font-black uppercase tracking-tighter text-uecg-text group-hover:text-uecg-blue transition-colors">
                Tomar Asistencia
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray mt-1">
                Ingresar al libro diario
              </p>
            </div>
            <div className="p-5 flex items-center justify-center">
              <ArrowRight className="text-uecg-gray group-hover:text-uecg-blue group-hover:translate-x-2 transition-all w-5 h-5" aria-hidden="true" />
            </div>
          </motion.div>
        </Link>

        <Link 
          to="/grades" 
          className="no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-uecg-dark focus-visible:ring-offset-2 focus-visible:z-10 rounded block transition-all"
        >
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.15, ease: "easeOut" } }}
            className="border border-uecg-line bg-white hover:border-uecg-text transition-colors group flex items-stretch h-28 shadow-sm cursor-pointer"
          >
            <div className="w-3 bg-uecg-dark group-hover:bg-black transition-colors h-full" />
            <div className="p-5 flex flex-col justify-center flex-1">
              <h3 className="text-lg font-black uppercase tracking-tighter text-uecg-text">
                Libreta Escolar
              </h3>
              <p className="text-[9px] font-bold uppercase tracking-widest text-uecg-gray mt-1">
                Registrar notas Ley 070
              </p>
            </div>
            <div className="p-5 flex items-center justify-center">
              <BookOpen className="text-uecg-gray group-hover:text-uecg-text group-hover:scale-110 transition-all w-5 h-5" aria-hidden="true" />
            </div>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
