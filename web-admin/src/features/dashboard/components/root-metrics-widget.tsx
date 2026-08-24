import { UsersRound, ShieldAlert, Database, ActivitySquare, Server } from "lucide-react";
import { motion } from "framer-motion";
import type { RootStats } from "../types/dashboard.types";

interface RootMetricsWidgetProps {
  stats: RootStats | undefined;
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

export default function RootMetricsWidget({ stats, isLoading }: RootMetricsWidgetProps) {
  return (
    <section 
      aria-labelledby="root-metrics-title"
      className="flex flex-col gap-6 transition-all duration-500"
    >
      <div className="flex justify-between items-end border-b border-uecg-line pb-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#00FF88] bg-uecg-dark px-2 py-1">
            Nivel Root
          </span>
          <h2 id="root-metrics-title" className="text-2xl mt-2 font-black tracking-tighter uppercase text-uecg-text leading-none">
            Centro de Mando
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-uecg-dark text-white px-3 py-1.5 shadow-sm" aria-hidden="true">
          <ActivitySquare className="w-3.5 h-3.5 text-[#00FF88]" />
          <span className="text-[9px] font-black uppercase tracking-widest">Sistema Operativo</span>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-0 border border-uecg-line bg-white"
      >
        {/* Cuentas */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="accounts-label"
        >
          <div className="flex justify-between items-start">
            <span id="accounts-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Cuentas<br />Registradas
            </span>
            <UsersRound className="text-uecg-text w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-20 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-24 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-text tracking-tighter block leading-none">
                  {stats?.accounts ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Personal Autorizado
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Roles RBAC */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b xl:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="roles-label"
        >
          <div className="flex justify-between items-start">
            <span id="roles-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Políticas<br />Seguridad RBAC
            </span>
            <ShieldAlert className="text-uecg-text w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 w-16 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-20 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className="text-4xl font-black text-uecg-text tracking-tighter block leading-none">
                  {stats?.roles ?? 0}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Roles Activos
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Base de Datos */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col group h-36 p-5 border-r border-b md:border-b-0 border-uecg-line"
          role="region"
          aria-labelledby="db-label"
        >
          <div className="flex justify-between items-start">
            <span id="db-label" className="text-[9px] font-black uppercase tracking-widest text-uecg-gray leading-tight">
              Motor de Datos<br />PostgreSQL
            </span>
            <Database className="text-uecg-text w-4 h-4" aria-hidden="true" />
          </div>
          <div className="mt-auto" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-7 w-24 bg-gray-200 animate-pulse" />
                <div className="h-2.5 w-28 bg-gray-100 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className="text-3xl font-black text-uecg-text tracking-tighter block leading-none">
                  {stats?.dbSize || "0 MB"}
                </span>
                <span className="text-[8px] font-bold text-uecg-gray uppercase tracking-widest mt-1 block">
                  Almacenamiento Usado
                </span>
              </>
            )}
          </div>
        </motion.div>

        {/* Servidor / Render */}
        <motion.div 
          variants={itemVariants} 
          className="flex flex-col bg-uecg-dark text-white group relative overflow-hidden h-36 p-5"
          role="region"
          aria-labelledby="server-label"
        >
          <span id="server-label" className="text-[9px] font-black uppercase tracking-widest text-white/50 relative z-10">
            Estado Servidor
          </span>
          <div className="mt-auto relative z-10" aria-live="polite" aria-busy={isLoading}>
            {isLoading ? (
              <div className="flex flex-col gap-1">
                <div className="h-7 w-28 bg-white/20 animate-pulse" />
                <div className="h-2.5 w-20 bg-white/10 animate-pulse mt-1" />
              </div>
            ) : (
              <>
                <span className={`text-3xl font-black uppercase block leading-none flex items-center gap-2 ${stats?.status === "ONLINE" ? "text-[#00FF88]" : "text-red-400"}`}>
                  <Server className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" /> {stats?.status || "DESCONOCIDO"}
                </span>
                <p className="text-[8px] font-mono uppercase tracking-widest mt-1 text-white/50">
                  Latencia: {stats?.latency || "--ms"}
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
