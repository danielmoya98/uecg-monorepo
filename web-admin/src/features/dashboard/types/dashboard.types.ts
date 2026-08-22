export interface RootStats {
  accounts: number
  roles: number
  dbSize: string
  status: 'ONLINE' | 'OFFLINE' | string
  latency: string
}

export interface GlobalStats {
  students: number
  teachers: number
  classrooms: number
  lastSync: string
}

export interface TeacherStats {
  nextClassTime: string
  nextSubject: string
  nextGroup: string
  studentsCount: number
  attendanceStatus: string
  currentTrimester: string
}
