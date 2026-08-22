import type { TeacherAssignment } from '@/features/teacher-assignments/types/teacher-assignments.types'
import type { PhysicalSpace } from '@/features/physical-spaces/types/physical-spaces.types'

export interface ClassPeriod {
  id: string
  name: string
  startTime: string
  endTime: string
  shift: 'MANANA' | 'TARDE' | 'NOCHE'
  isBreak: boolean
  academicYearId?: string
}

export interface TimetableSlot {
  id: string
  dayOfWeek: number
  classPeriodId: string
  teacherAssignmentId: string
  classroomId: string
  teacherId: string
  physicalSpaceId?: string | null
  physicalSpace?: PhysicalSpace | null
  teacherAssignment: TeacherAssignment
}

export interface CreateSlotPayload {
  dayOfWeek: number
  classPeriodId: string
  teacherAssignmentId: string
  classroomId: string
  teacherId: string
  physicalSpaceId?: string | null
}

export type PeriodsResponse = ClassPeriod[]
export type ScheduleResponse = TimetableSlot[]
