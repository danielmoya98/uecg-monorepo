import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'
import { ShieldCheck, Layers } from 'lucide-react'

import { useRbacData } from '../hooks/use-rbac-data'
import { RbacHeader, RbacRestrictedAlert } from './rbac-header'

import RbacFilters from './rbac-filters'
import { RoleTable } from './role-table'
import { RoleGrid } from './role-grid'
import { RbacMatrix } from './rbac-matrix'
import RoleDrawer from './role-drawer'

export default function RbacPage() {
  // 1. Doble escudo de seguridad: validamos sesión y habilidades ABAC síncronas del router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageRoles = can('manage:all', 'Role')

  // 2. Control de Pestañas (Tab 1: Lista de perfiles, Tab 2: Matriz interactiva)
  const [activeTab, setActiveTab] = useState<'list' | 'matrix'>('list')

  // 3. Consumimos el Hook Co-localizado
  const {
    roles,
    isLoading,
    refetch,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    isDrawerOpen,
    drawerMode,
    selectedRole,
    handleAction,
    closeDrawer,
  } = useRbacData()

  if (!canManageRoles) {
    return <RbacRestrictedAlert />
  }

  // 4. Filtrado local ultra-rápido síncrono para roles en el listado
  const filteredRoles = roles.filter(
    (role) =>
      role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6 max-w-7xl relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)] justify-between pb-8">
      <div className="flex flex-col gap-6 w-full">
        {/* Cabecera Brutalista */}
        <RbacHeader onOpenCreate={() => handleAction('create')} />

        {/* Selector de Pestañas Geométrico (Swiss Tab System) */}
        <div
          className="flex border-b border-uecg-line w-full gap-2.5 mt-2"
          role="tablist"
          aria-label="Opciones de administración de seguridad"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'list'}
            aria-controls="panel-roles-list"
            onClick={() => setActiveTab('list')}
            className={`px-5 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-pointer border-t-[3px] transition-all ${
              activeTab === 'list'
                ? 'border-uecg-blue text-uecg-blue bg-white font-black'
                : 'border-transparent text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            } focus:outline-none focus:ring-1 focus:ring-uecg-blue`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            Perfiles Registrados
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'matrix'}
            aria-controls="panel-security-matrix"
            onClick={() => setActiveTab('matrix')}
            className={`px-5 py-3.5 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 cursor-pointer border-t-[3px] transition-all ${
              activeTab === 'matrix'
                ? 'border-uecg-blue text-uecg-blue bg-white font-black'
                : 'border-transparent text-uecg-gray hover:text-uecg-dark hover:bg-gray-50'
            } focus:outline-none focus:ring-1 focus:ring-uecg-blue`}
          >
            <ShieldCheck className="w-4 h-4 shrink-0" />
            Matriz de Permisos Global
          </button>
        </div>

        {/* CONTENIDOS DE PESTAÑAS */}
        <div className="w-full mt-2">
          {activeTab === 'list' ? (
            <div
              id="panel-roles-list"
              role="tabpanel"
              aria-labelledby="tab-roles-list"
              className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              {/* Filtros Rápidos (Buscador y Selector Grid/Table) */}
              <RbacFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
              />

              {viewMode === 'table' ? (
                <RoleTable roles={filteredRoles} isPending={isLoading} onAction={handleAction} />
              ) : (
                <RoleGrid roles={filteredRoles} isPending={isLoading} onAction={handleAction} />
              )}

            </div>
          ) : (
            <div
              id="panel-security-matrix"
              role="tabpanel"
              aria-labelledby="tab-security-matrix"
              className="w-full animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <RbacMatrix />
            </div>
          )}
        </div>
      </div>

      {/* Drawer Único Controlado para Creación, Edición de Permisos o Confirmación de Eliminación */}
      <RoleDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSuccess={() => refetch()}
        mode={drawerMode}
        roleData={selectedRole}
      />
    </div>
  )
}
