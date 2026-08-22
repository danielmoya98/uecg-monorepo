export interface Classroom {
  id: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  shift: 'MANANA' | 'TARDE' | 'NOCHE'
  grade: string
  section: string
  capacity: number
  advisor?: {
    id: string
    fullName: string
  } | null
  academicYear?: {
    id: string
    name: string
    status: string
  } | null
  baseRoom?: {
    id: string
    name: string
  } | null
}

export interface ClassroomPayload {
  academicYearId: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  shift: 'MANANA' | 'TARDE' | 'NOCHE'
  grade: string
  section: string
  capacity: number
  advisorId?: string | null
  baseRoomId?: string | null
}

export interface BulkClassroomPayload {
  academicYearId: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  shift: 'MANANA' | 'TARDE' | 'NOCHE'
  classrooms: {
    grade: string
    section: string
    capacity: number
    baseRoomId?: string | null
  }[]
}

export interface BulkClassroomResponse {
  createdCount: number
  message: string
}
