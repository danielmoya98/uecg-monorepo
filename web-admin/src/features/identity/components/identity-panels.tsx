import { ScanFace, Users, ShieldCheck, Download, Loader2 } from 'lucide-react'
import { PageHeader } from '@/shared/ui/page-header'
import { CustomSelect } from './custom-select'
import type { Option } from '../types/identity.types'

export const IdentityHeader = () => (
  <PageHeader
    breadcrumbs={[
      { label: 'CONTROL ESCOLAR' },
      { label: 'IDENTIDAD DIGITAL', href: '/identity' },
      { label: 'CENTRO DE CARNETIZACIÓN', icon: ScanFace },
    ]}
    title="Centro de Carnetización"
    description="Generación masiva de Identidades Digitales (QR) y credenciales impresas."
  />
)


export const IdentitySkeleton = () => (
  <div className="flex flex-col gap-8 w-full relative animate-in fade-in duration-300">
    <IdentityHeader />


    <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 border border-uecg-line shadow-sm bg-white animate-pulse">
      {/* Columna Izquierda: Filtros Skeleton */}
      <div className="lg:col-span-8 flex flex-col p-6 md:p-8 bg-white gap-8">
        <div className="flex items-start gap-4 bg-gray-50 border border-uecg-line p-5">
          <div className="w-10 h-10 bg-gray-200 shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <div className="h-4 w-40 bg-gray-200" />
            <div className="h-3 w-3/4 bg-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-11 bg-gray-100 border border-uecg-line" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="h-3 w-28 bg-gray-200" />
            <div className="h-11 bg-gray-100 border border-uecg-line" />
          </div>
        </div>
      </div>

      {/* Columna Derecha: Panel de Acción Skeleton */}
      <div className="lg:col-span-4 bg-uecg-dark text-white p-6 md:p-8 flex flex-col justify-center items-center text-center border-t lg:border-t-0 lg:border-l border-uecg-line gap-4">
        <div className="w-12 h-12 bg-white/20" />
        <div className="h-4 w-36 bg-white/20 mt-2" />
        <div className="h-3 w-48 bg-white/10" />
        <div className="h-3 w-40 bg-white/10" />
        <div className="w-full h-14 bg-white/20 mt-auto" />
      </div>
    </div>
  </div>
)

interface FilterPanelProps {
  levelFilter: string
  setLevelFilter: (v: string) => void
  levelOptions: Option[]
  classroomFilter: string
  setClassroomFilter: (v: string) => void
  classroomOptions: Option[]
}

export const ExportFiltersPanel = ({
  levelFilter,
  setLevelFilter,
  levelOptions,
  classroomFilter,
  setClassroomFilter,
  classroomOptions,
}: FilterPanelProps) => (
  <div className="lg:col-span-8 flex flex-col p-6 md:p-8 bg-white">
    <div className="flex items-start gap-4 mb-8 bg-blue-50/50 border border-blue-100 p-5 hover:border-uecg-blue transition-colors">
      <div className="w-10 h-10 bg-uecg-blue text-white flex items-center justify-center shrink-0 shadow-sm">
        <Users className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-widest text-uecg-dark">
          Filtros de Exportación
        </h3>
        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-1.5 leading-relaxed">
          Seleccione el nivel o curso específico. Si deja ambos filtros en "TODOS", el servidor
          procesará y empaquetará los carnets de{' '}
          <span className="text-uecg-blue font-black">toda la unidad educativa</span>.
        </p>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-auto">
      <div className="flex flex-col gap-2 relative z-20">
        <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-1.5">
          <span className="w-4 h-4 bg-gray-200 text-uecg-gray flex items-center justify-center rounded-none text-[9px]">
            1
          </span>
          Nivel Educativo
        </label>
        <CustomSelect
          value={levelFilter}
          onChange={(val) => {
            setLevelFilter(val)
            setClassroomFilter('')
          }}
          options={levelOptions}
          placeholder="TODA LA INSTITUCIÓN"
        />
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        <label className="text-[10px] font-black uppercase tracking-widest text-uecg-gray flex items-center gap-1.5">
          <span className="w-4 h-4 bg-gray-200 text-uecg-gray flex items-center justify-center rounded-none text-[9px]">
            2
          </span>
          Curso Específico
        </label>
        <CustomSelect
          value={classroomFilter}
          onChange={setClassroomFilter}
          options={classroomOptions}
          placeholder="TODOS LOS CURSOS"
          disabled={!levelFilter}
        />
      </div>
    </div>
  </div>
)

interface ExportActionPanelProps {
  isExporting: boolean
  onExport: () => void
}

export const ExportActionPanel = ({ isExporting, onExport }: ExportActionPanelProps) => (
  <div className="lg:col-span-4 bg-uecg-dark text-white p-6 md:p-8 flex flex-col justify-center relative overflow-hidden group border-t lg:border-t-0 lg:border-l border-uecg-line">
    <div className="absolute -right-8 -bottom-8 w-32 h-32 border-[8px] border-white opacity-5 rounded-none rotate-45 pointer-events-none group-hover:scale-110 transition-transform duration-500" />
    <div className="absolute left-8 top-8 w-12 h-12 bg-white opacity-5 -rotate-12 pointer-events-none" />

    <div className="relative z-10 flex flex-col items-center text-center h-full">
      <ShieldCheck className="w-12 h-12 text-uecg-blue mb-4" />
      <h3 className="text-xs font-black uppercase tracking-widest text-white mb-2">
        Lote de Producción
      </h3>
      <p className="text-[10px] font-bold text-blue-200/70 uppercase tracking-widest leading-relaxed mb-8">
        El sistema compilará un archivo ZIP con todos los PDF en formato CR80 (Doble Cara) listos
        para enviar a imprenta.
      </p>

      <button
        onClick={onExport}
        id="btn-generate-cards"
        data-tour="btn-generate-cards"
        disabled={isExporting}
        type="button"
        className="w-full mt-auto py-5 px-4 font-black uppercase tracking-widest text-[11px] bg-uecg-blue text-white hover:bg-blue-600 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed outline-none cursor-pointer"
      >
        {isExporting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Download className="w-5 h-5" />
        )}
        {isExporting ? 'Compilando ZIP...' : 'Ejecutar Generación'}
      </button>
    </div>
  </div>
)
