import { useState } from 'react'
import type { PhysicalSpace } from '../types/physical-spaces.types'

export const usePhysicalSpacesDrawers = (canManageSpaces: boolean) => {
  const [isFormDrawerOpen, setIsFormDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create')
  const [selectedSpace, setSelectedSpace] = useState<PhysicalSpace | null>(null)

  const [isDeleteDrawerOpen, setIsDeleteDrawerOpen] = useState(false)
  const [spaceToDelete, setSpaceToDelete] = useState<PhysicalSpace | null>(null)

  const openCreate = () => {
    if (!canManageSpaces) return
    setDrawerMode('create')
    setSelectedSpace(null)
    setIsFormDrawerOpen(true)
  }

  const openEdit = (space: PhysicalSpace) => {
    if (!canManageSpaces) return
    setDrawerMode('edit')
    setSelectedSpace(space)
    setIsFormDrawerOpen(true)
  }

  const closeForm = () => {
    setIsFormDrawerOpen(false)
    setSelectedSpace(null)
  }

  const openDelete = (space: PhysicalSpace) => {
    if (!canManageSpaces) return
    setSpaceToDelete(space)
    setIsDeleteDrawerOpen(true)
  }

  const closeDelete = () => {
    setIsDeleteDrawerOpen(false)
    setSpaceToDelete(null)
  }

  return {
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
  }
}
