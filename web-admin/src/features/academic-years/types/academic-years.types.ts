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

export type ReadinessStepStatus = 'COMPLETED' | 'IN_PROGRESS' | 'PENDING'

export interface ReadinessStep {
  id: string
  stepNumber: number
  title: string
  description: string
  status: ReadinessStepStatus
  progressLabel: string
  actionUrl: string
  actionLabel: string
}

export interface AcademicYearReadinessResponse {
  academicYear: {
    id: string
    year: number
    status: AcademicYearStatus
  } | null
  percentage: number
  completedSteps: number
  totalSteps: number
  steps: ReadinessStep[]
}
