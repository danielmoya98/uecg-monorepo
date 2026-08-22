export interface ScanPayload {
  qrToken: string;
  classPeriodIds?: string[];
  classPeriodId?: string;
}

export interface MonitorQuery {
  classroomId: string;
  classPeriodId: string;
  date?: string;
}

export interface ManualAttendancePayload {
  enrollmentId: string;
  classPeriodId?: string;
  classPeriodIds?: string[];
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
}

export interface DailyBlock {
  id: string;
  startTime: string;
  endTime: string;
  subjectName: string;
  teacherName?: string;
  classPeriodIds: string[];
  classroomId: string;
  classroom: {
    grade: string;
    section: string;
    level: string;
  };
}

export interface AttendanceSettings {
  enableQrAttendance: boolean;
  enableBiometricAttendance: boolean;
  lateToleranceMinutes: number;
  absentToleranceMinutes: number;
  notificationFrequency: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  classPeriod: {
    id: string;
    name: string;
    startTime: string;
  };
}

export interface StudentAttendanceStatus {
  studentId: string;
  enrollmentId: string;
  fullName: string;
  status: 'PENDING' | 'PRESENT' | 'LATE' | 'ABSENT' | 'EXCUSED';
  timestamp?: string;
}

export interface MonitorSummary {
  total: number;
  present: number;
  late: number;
  absent: number;
  pending: number;
}

export interface MonitorResponse {
  data: StudentAttendanceStatus[];
  summary: MonitorSummary;
}
