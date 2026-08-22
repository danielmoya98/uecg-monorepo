import type { Classroom } from '@/features/classrooms/types/classrooms.types'
import type { Subject } from '@/features/subjects/types/subjects.types'

export interface TeacherAssignment {
  id: string
  classroom: Classroom
  subject: Subject
  teacher: {
    id: string
    fullName: string
    email?: string
  }
}

export interface CreateTeacherAssignmentPayload {
  classroomId: string
  subjectId: string
  teacherId: string
}

export interface CloneTeacherAssignmentsPayload {
  targetClassroomIds: string[]
  assignments: {
    subjectId: string
    teacherId: string
  }[]
}

export interface CloneResponse {
  clonedCount: number
  message?: string
}

export interface TeacherAssignmentsResponse {
  data: TeacherAssignment[]
  meta?: {
    total: number
    totalPages: number
  }
}
