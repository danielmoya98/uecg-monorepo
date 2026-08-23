export interface Subject {
  id: string
  name: string
  code?: string | null
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  area?: string | null
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface SubjectPaginationMeta {
  total: number
  totalPages: number
  page: number
  limit: number
}

export interface SubjectsResponse {
  data: Subject[]
  meta: SubjectPaginationMeta
}

export interface SubjectPayload {
  name: string
  code?: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  area?: string
  isActive?: boolean
}

