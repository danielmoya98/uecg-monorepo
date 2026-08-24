export interface User {
  id: string
  fullName: string
  email: string
  role: 'SUPER_ADMIN' | 'DIRECTOR' | 'DOCENTE' | 'PADRE' | string
  status: 'ACTIVE' | 'INACTIVE'
  createdAt?: string
}

export interface UserPaginationMeta {
  total: number
  totalPages: number
  currentPage: number
  limit: number
}

export interface UsersResponse {
  data: User[]
  meta: UserPaginationMeta
}

export interface CreateUserPayload {
  fullName: string
  email: string
  passwordRaw: string
  role: string
}

export interface UpdateUserPayload {
  fullName: string
  role: string
}
