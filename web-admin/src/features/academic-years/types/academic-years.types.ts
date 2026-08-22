export type AcademicYearStatus = 'PLANNING' | 'ACTIVE' | 'CLOSED'

export interface AcademicYearData {
  id: string
  year: number
  name: string
  startDate: string
  endDate: string
  status: AcademicYearStatus
}

export interface AcademicYearPayload {
  year: number
  name: string
  startDate: string
  endDate: string
  status: AcademicYearStatus
}

export interface Trimester {
  id: string
  academicYearId: string
  name: string
  startDate: string
  endDate: string
  isOpen: boolean
}
