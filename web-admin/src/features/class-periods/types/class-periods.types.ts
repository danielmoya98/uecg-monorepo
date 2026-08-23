export type ShiftType = 'MANANA' | 'TARDE' | 'NOCHE'

export interface ClassPeriodPayload {
  name: string
  startTime: string
  endTime: string
  shift: ShiftType
  isBreak: boolean
  order: number
  isActive?: boolean
}

export interface ClassPeriod extends ClassPeriodPayload {
  id: string
}

