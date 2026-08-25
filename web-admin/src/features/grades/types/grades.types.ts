import type { Subject } from '@/features/subjects/types/subjects.types'

export interface Grade {
  id?: string
  scoreSer: number | null
  scoreSaber: number | null
  scoreHacer: number | null
  scoreAuto: number | null
  recoveryScore: number | null
  finalScore?: number | null
}

export interface Student {
  id: string
  names: string
  lastNamePaterno: string
  lastNameMaterno: string
}

export interface Enrollment {
  id: string
  student: Student
}

export interface StudentGradeRowData {
  enrollmentId: string
  student: Student
  grade: Grade | null
}

export interface GradeInput {
  ser: string
  saber: string;
  hacer: string;
  auto: string;
  recovery: string;
}

export interface UpsertGradePayload {
  enrollmentId: string
  teacherAssignmentId: string
  trimesterId: string
  scoreSer?: number | null
  scoreSaber?: number | null
  scoreHacer?: number | null
  scoreAuto?: number | null
  recoveryScore?: number | null
}

export interface BulkGradesPayload {
  teacherAssignmentId: string
  trimesterId: string
  grades: Array<{
    enrollmentId: string
    scoreSer?: number | null
    scoreSaber?: number | null
    scoreHacer?: number | null
    scoreAuto?: number | null
    recoveryScore?: number | null
    status?: string
  }>
}

export interface ChangeRequestPayload {
  gradeId: string
  reason: string
  proposedSer?: number | null
  proposedSaber?: number | null
  proposedHacer?: number | null
  proposedAuto?: number | null
  proposedRecovery?: number | null
}

export interface ChangeRequest {
  id: string
  createdAt: string
  reason: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  proposedSer?: number | null
  proposedSaber?: number | null
  proposedHacer?: number | null
  proposedAuto?: number | null
  proposedRecovery?: number | null
  rejectionReason?: string | null
  grade: {
    id: string
    scoreSer: number | null
    scoreSaber: number | null
    scoreHacer: number | null
    scoreAuto: number | null
    recoveryScore: number | null
    finalScore: number | null
    enrollment: {
      student: Student
    }
    teacherAssignment: {
      subject: Subject
      teacher: {
        id: string
        fullName: string
      }
    }
    trimester: {
      id: string
      name: string
    }
  }
}
