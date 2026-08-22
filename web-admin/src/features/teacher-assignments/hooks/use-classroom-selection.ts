import { useState } from 'react'
import type { Classroom } from '@/features/classrooms/types/classrooms.types'

export const useClassroomSelection = (classrooms: Classroom[]) => {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Derivar la selección actual directamente durante el renderizado
  const selectedClassroom =
    classrooms.find((c) => c.id === selectedId) || classrooms[0] || null

  const handleSelectClassroom = (classroom: Classroom) => {
    setSelectedId(classroom.id)
  }

  return {
    selectedClassroom,
    handleSelectClassroom,
  }
}
