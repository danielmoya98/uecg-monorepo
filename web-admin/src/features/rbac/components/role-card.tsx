import { ShieldCheck, Settings2, Trash2, Users } from 'lucide-react'
import type { Role } from '../api/rbac.service'
import type { RoleDrawerMode } from './role-drawer'

const PROTECTED_ROLES = ['SUPER_ADMIN', 'DIRECTOR', 'DOCENTE', 'PADRE', 'ESTUDIANTE']

interface RoleCardProps {
  role: Role
  onAction: (mode: RoleDrawerMode, role: Role) => void
}

export const RoleCard = ({ role, onAction }: RoleCardProps) => {
  const userCount = role._count?.users || 0
  const permCount = role.permissions?.length || 0
  const isProtected = PROTECTED_ROLES.includes(role.name)

  return (
    <article className="group flex flex-col text-left border border-uecg-line bg-white hover:border-uecg-blue hover:shadow-lg transition-all duration-300 h-56 relative overflow-hidden focus-within:ring-2 focus-within:ring-uecg-blue">
      {/* Geometría Abstracta */}
      <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-uecg-blue/5 rounded-none rotate-45 pointer-events-none group-hover:scale-150 group-hover:bg-uecg-blue/10 transition-transform duration-500" />

      <div className="p-5 flex-1 w-full relative z-10">
        <div className="flex justify-between items-start">
          <span className="text-[9px] font-black text-uecg-gray uppercase tracking-widest border border-uecg-line px-2 py-0.5 bg-gray-50 group-hover:border-blue-200 group-hover:text-uecg-blue transition-colors">
            Código: {role.name}
          </span>
          {isProtected && (
            <ShieldCheck className="w-4 h-4 text-uecg-blue" aria-label="Rol Protegido del Sistema" />
          )}
        </div>

        <h3 className="text-2xl font-black uppercase tracking-tighter text-uecg-dark mt-3.5 leading-none group-hover:text-uecg-blue transition-colors">
          {role.name.replace(/_/g, ' ')}
        </h3>

        <p className="text-[10px] font-bold text-uecg-gray uppercase tracking-widest mt-2 line-clamp-2 leading-relaxed">
          {role.description || 'Sin descripción establecida.'}
        </p>

        <div className="flex gap-4 mt-4">
          <div
            className="flex items-center gap-1.5"
            title={`${userCount} usuarios asignados a este perfil`}
          >
            <Users className="w-3.5 h-3.5 text-uecg-blue" />
            <span className="text-xs font-black text-uecg-dark">{userCount}</span>
            <span className="sr-only">usuarios asignados</span>
          </div>
          <div
            className="flex items-center gap-1.5"
            title={`${permCount} permisos activos en la matriz`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-uecg-gray" />
            <span className="text-xs font-black text-uecg-dark">{permCount}</span>
            <span className="sr-only">permisos concedidos</span>
          </div>
        </div>
      </div>

      {/* Barra de Acciones Estilo Suizo */}
      <div className="w-full border-t border-uecg-line bg-gray-50 flex h-12 relative z-10 divide-x divide-uecg-line mt-auto">
        <button
          type="button"
          onClick={() => onAction('edit_permissions', role)}
          className="flex-1 text-[10px] font-black uppercase tracking-widest hover:bg-uecg-blue hover:text-white transition-all flex items-center justify-center gap-2 cursor-pointer outline-none focus:bg-uecg-blue focus:text-white"
          aria-label={`Editar permisos de la matriz para el rol ${role.name}`}
        >
          <Settings2 className="w-3.5 h-3.5" /> Matriz
        </button>
        <button
          type="button"
          onClick={() => onAction('delete', role)}
          disabled={isProtected}
          className="flex-1 text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-gray-100 disabled:hover:text-gray-400 disabled:cursor-not-allowed cursor-pointer outline-none focus:bg-red-600 focus:text-white"
          aria-label={`Eliminar el rol ${role.name}`}
        >
          <Trash2 className="w-3.5 h-3.5" /> Eliminar
        </button>
      </div>
    </article>
  )
}
