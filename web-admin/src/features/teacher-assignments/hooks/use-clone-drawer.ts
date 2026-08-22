import { useState } from 'react'
import type { TeacherAssignment } from '../types/teacher-assignments.types'

export const useCloneDrawer = (canManageAssignments: boolean) => {
  const [isCloneDrawerOpen, setIsCloneDrawerOpen] = useState(false)
  const [assignmentsToClone, setAssignmentsToClone] = useState<TeacherAssignment[]>([])

  const handleOpenClone = (assignments: TeacherAssignment[]) => {
    if (!canManageAssignments) return
    setAssignmentsToClone(assignments)
    setIsCloneDrawerOpen(true)
  }

  const closeCloneDrawer = () => {
    setIsCloneDrawerOpen(false)
    setAssignmentsToClone([])
  }

  return {
    isCloneDrawerOpen,
    assignmentsToClone,
    handleOpenClone,
    closeCloneDrawer,
  }
}
