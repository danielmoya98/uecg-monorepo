export interface Option {
  value: string
  label: string
}

export interface Student {
  id: string
  names: string
  lastNamePaterno: string
  lastNameMaterno?: string
  ci?: string
  rudeCode?: string
}

export interface Classroom {
  id: string
  grade: string
  section: string
  shift: string
  level: string
}

export interface AcademicYear {
  id: string
  year: number
  status: 'ACTIVE' | 'CLOSED'
}

export interface Enrollment {
  id: string
  student: Student
  classroom: Classroom
  academicYear: AcademicYear
}

export interface QRAccessResult {
  isActive: boolean
  qr: string | null
}

export interface MassExportFilters {
  level?: string
  classroomId?: string
}

export interface ExportReadyPayload {
  message: string
  fileName: string
}
