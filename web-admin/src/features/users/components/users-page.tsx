import { useRouteContext } from '@tanstack/react-router'
import { Plus, UserCog, Loader2, ShieldAlert } from 'lucide-react'

import { useUsersData } from '../hooks/use-users-data'
import UsersFilters from './users-filters'
import UsersTable from './users-table'
import UsersGrid from './users-grid'
import UsersPagination from './users-pagination'
import UserDrawer from './user-drawer'

export default function UsersPage() {
  // 1. Doble Escudo de Seguridad ABAC (Router context)
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageUsers = can('manage:all', 'User')

  // 2. Consumimos el Hook Co-localizado Autónomo
  const {
    // Filtros y Paginación
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    filterRole,
    setFilterRole,
    viewMode,
    setViewMode,

    // Drawer y Selección
    isDrawerOpen,
    drawerMode,
    selectedUser,
    handleAction,
    closeDrawer,

    // Datos
    displayUsers,
    meta,
    isPending,
    isFetching,
    refetch,

    // Mutaciones
    createMutation,
    updateMutation,
    deleteMutation,
    reactivateMutation,
    resetPasswordMutation,
  } = useUsersData()

  // Alerta de Acceso Restringido síncrono
  if (!canManageUsers) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-red-200 bg-red-50/50 shadow-sm w-full min-h-[400px]">
        <div className="w-16 h-16 bg-red-50 border border-red-200 rounded-full flex items-center justify-center mb-5 animate-pulse">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-black uppercase tracking-tighter text-red-800 mb-2">
          Acceso Restringido
        </h3>
        <p className="text-xs text-red-700 font-bold uppercase tracking-widest max-w-md leading-relaxed">
          Tu cuenta no cuenta con las facultades operativas suficientes para gestionar usuarios en el servidor.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-7xl relative animate-in fade-in duration-300 w-full min-h-[calc(100vh-140px)] justify-between pb-8">
      <div className="flex flex-col gap-6 w-full relative">
        {/* Indicador de carga sutil de actualización en segundo plano */}
        {isFetching && !isPending && (
          <div className="absolute top-0 right-0 flex items-center gap-2 text-uecg-blue text-[10px] font-bold uppercase tracking-widest bg-blue-50 px-3 py-1.5 animate-pulse rounded-sm z-10 border border-blue-100 shadow-sm">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Actualizando...
          </div>
        )}

        {/* CABECERA (Brutalismo Suizo) */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-uecg-line pb-4 mt-2">
          <div>
            <span className="label-swiss !text-[10px]">Administración</span>
            <h1 className="text-4xl mt-1 font-black tracking-tighter uppercase text-uecg-dark flex items-center gap-3">
              <UserCog className="w-8 h-8 text-uecg-blue shrink-0" />
              Usuarios del Sistema
            </h1>
          </div>
          <button
            type="button"
            onClick={() => handleAction('create')}
            className="px-5 py-3.5 font-black uppercase tracking-widest text-[10px] bg-uecg-blue text-white hover:bg-uecg-dark transition-all flex items-center gap-2 shadow-[4px_4px_0px_rgba(0,0,0,0.15)] hover:shadow-[4px_4px_0px_rgba(0,0,0,0.35)] cursor-pointer outline-none focus:ring-2 focus:ring-uecg-blue"
          >
            <Plus className="w-4 h-4" /> Nuevo Usuario
          </button>
        </header>

        {/* FILTROS (Buscador, Toggle y Rol Combobox) */}
        <UsersFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterRole={filterRole}
          onRoleChange={setFilterRole}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* CONTENIDOS DE VISTAS (Condicional Tabla/Grid) */}
        <div className="w-full mt-2">
          {viewMode === 'table' ? (
            <UsersTable
              users={displayUsers}
              isPending={isPending}
              isFetching={isFetching}
              onAction={handleAction}
            />
          ) : (
            <UsersGrid
              users={displayUsers}
              isPending={isPending}
              isFetching={isFetching}
              onAction={handleAction}
            />
          )}
        </div>
      </div>

      {/* PAGINACIÓN */}
      <UsersPagination
        page={page}
        totalPages={meta.totalPages}
        totalItems={meta.total}
        onPageChange={setPage}
      />

      {/* DRAWER LATERAL CONTROLADO PORTAL */}
      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        onSuccess={() => refetch()}
        mode={drawerMode}
        userData={selectedUser}
        createMutation={createMutation}
        updateMutation={updateMutation}
        deleteMutation={deleteMutation}
        reactivateMutation={reactivateMutation}
        resetPasswordMutation={resetPasswordMutation}
      />
    </div>
  )
}
