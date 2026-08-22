export interface AuthUser {
  id: string
  fullName: string
  email: string
  role: string
  permissions: string[]
}

export interface LoginResponse {
  status: 'SUCCESS' | 'SETUP_REQUIRED'

  message?: string

  setupToken?: string

  user?: AuthUser
}

export interface LoginPayload {
  email: string
  password: string
}
