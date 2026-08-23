export type SpaceType = 'SALON' | 'LABORATORIO' | 'CANCHA' | 'AUDITORIO' | 'OTRO'

export interface PhysicalSpace {
  id: string
  name: string
  type: SpaceType
  capacity?: number | null
  building?: string | null
  floor?: string | null
  description?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export type PhysicalSpacePayload = Omit<PhysicalSpace, 'id' | 'createdAt' | 'updatedAt'>
