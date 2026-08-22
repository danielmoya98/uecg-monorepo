export interface PhysicalSpace {
  id: string
  name: string
  type: 'SALON' | 'LABORATORIO' | 'CANCHA' | 'AUDITORIO' | 'OTRO'
  isActive: boolean
  capacity?: number
  status?: string
}

export type PhysicalSpacePayload = Omit<PhysicalSpace, 'id'>
