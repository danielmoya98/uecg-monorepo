import { api } from '@/shared/api/client'
import type {
  ScanPayload,
  MonitorQuery,
  ManualAttendancePayload,
  DailyBlock,
  AttendanceSettings,
  AttendanceRecord,
  MonitorResponse,
} from '../types/attendance.types'

export const AttendanceService = {
  scanQR: async (payload: ScanPayload) => {
    const response = await api.post('/attendance/scan', payload)
    return response.data
  },

  getClassPeriods: async () => {
    const response = await api.get('/class-periods')
    return response.data.data !== undefined ? response.data.data : response.data
  },

  getClassrooms: async () => {
    const response = await api.get('/classrooms')
    return response.data.data !== undefined ? response.data.data : response.data
  },

  getMonitor: async (query: MonitorQuery): Promise<MonitorResponse> => {
    const response = await api.get('/attendance/monitor', { params: query })
    if (response.data && response.data.data && response.data.data.summary) {
      return response.data.data
    }
    return response.data
  },

  markManual: async (payload: ManualAttendancePayload) => {
    const response = await api.post('/attendance/manual', payload)
    return response.data
  },

  getSettings: async (): Promise<AttendanceSettings> => {
    const response = await api.get('/institutions/attendance-settings')
    return response.data.data !== undefined ? response.data.data : response.data
  },

  getStudentDebts: async (enrollmentId: string): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/attendance/history/${enrollmentId}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  justify: async (recordId: string, justification: string) => {
    const response = await api.patch(`/attendance/justify/${recordId}`, {
      justification,
    })
    return response.data
  },

  getDailySchedule: async (date: string): Promise<DailyBlock[]> => {
    const response = await api.get(`/attendance/schedule?date=${date}`)
    return response.data.data !== undefined ? response.data.data : response.data
  },

  getClassroomAttendance: async (
    classroomId: string,
    classPeriodId: string,
    date: string,
  ) => {
    const response = await api.get(
      `/attendance/classroom?classroomId=${classroomId}&classPeriodId=${classPeriodId}&date=${date}`,
    )
    return response.data.data !== undefined ? response.data.data : response.data
  },

  saveBulk: async (payload: unknown) => {
    const response = await api.post('/attendance/bulk', payload)
    return response.data
  },
}
