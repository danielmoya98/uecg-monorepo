import { useRouteContext } from '@tanstack/react-router'
import { ShieldAlert } from 'lucide-react'

import { useUsersData } from '../hooks/use-users-data'
import { UsersHeader } from './users-header'
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
    <div className="flex flex-col gap-6 w-full relative animate-in fade-in duration-300 min-h-[calc(100vh-140px)] justify-between pb-8">
      <div className="flex flex-col gap-6 w-full relative">

        {/* CABECERA (Brutalismo Suizo) */}
        <UsersHeader
          onOpenCreate={() => handleAction('create')}
          isFetching={isFetching}
          isPending={isPending}
        />

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
