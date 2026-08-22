export interface Subject {
  id: string
  name: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  area?: string
  createdAt?: string
}

export interface SubjectPaginationMeta {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface SubjectsResponse {
  data: Subject[]
  meta: SubjectPaginationMeta
}

export interface SubjectPayload {
  name: string
  level: 'INICIAL' | 'PRIMARIA' | 'SECUNDARIA'
  area?: string
}
