import { useState } from 'react'
import { useRouteContext } from '@tanstack/react-router'

// Hooks SRP
import { usePhysicalSpacesData } from '../hooks/use-physical-spaces-data'
import { usePhysicalSpacesDrawers } from '../hooks/use-physical-spaces-drawers'

// Componentes
import { PhysicalSpacesHeader } from './physical-spaces-header'
import PhysicalSpacesFilters from './physical-spaces-filters'
import PhysicalSpacesTable from './physical-spaces-table'
import PhysicalSpacesGrid from './physical-spaces-grid'

// Modales
import PhysicalSpaceDrawer from './physical-space-drawer'
import DeletePhysicalSpaceDrawer from './delete-physical-space-drawer'

export default function PhysicalSpacesPage() {
  // 1. Escudo ABAC usando el contexto de ruta seguro de TanStack Router
  const { can } = useRouteContext({ from: '/_authenticated' })
  const canManageSpaces = can('manage:all', 'PhysicalSpace')

  // Toggle de Vista local
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  // 2. Inyección de Datos y Filtros
  const {
    selectedType,
    setSelectedType,
    searchTerm,
    setSearchTerm,
    spaces,
    isPending,
    deleteSpace,
    isDeleting,
  } = usePhysicalSpacesData()

  // 3. Inyección de Estados Modales
  const {
    isFormDrawerOpen,
    drawerMode,
    selectedSpace,
    openCreate,
    openEdit,
    closeForm,
    isDeleteDrawerOpen,
    spaceToDelete,
    openDelete,
    closeDelete,
  } = usePhysicalSpacesDrawers(canManageSpaces)

  return (
    <div className="flex flex-col gap-6 max-w-7xl relative animate-in fade-in duration-300">
      {/* Cabecera */}
      <PhysicalSpacesHeader canManageSpaces={canManageSpaces} onOpenCreate={openCreate} />

      {/* Barra de Filtros */}
      <PhysicalSpacesFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Renderizado Condicional de Vistas */}
      {viewMode === 'table' ? (
        <PhysicalSpacesTable
          spaces={spaces}
          isPending={isPending}
          onEdit={openEdit}
          onDeletePrompt={openDelete}
          canManage={canManageSpaces}
        />
      ) : (
        <PhysicalSpacesGrid
          spaces={spaces}
          isPending={isPending}
          onEdit={openEdit}
          onDeletePrompt={openDelete}
          canManage={canManageSpaces}
        />
      )}

      {/* Renderizado de Modales por Portales y Seguridad ABAC */}
      {canManageSpaces && (
        <>
          <PhysicalSpaceDrawer
            isOpen={isFormDrawerOpen}
            onClose={closeForm}
            mode={drawerMode}
            data={selectedSpace}
          />

          <DeletePhysicalSpaceDrawer
            isOpen={isDeleteDrawerOpen}
            onClose={closeDelete}
            space={spaceToDelete}
            onConfirm={async (id) => {
              await deleteSpace(id)
              closeDelete()
            }}
            isDeleting={isDeleting}
          />
        </>
      )}
    </div>
  )
}
