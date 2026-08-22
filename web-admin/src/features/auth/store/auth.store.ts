import { create } from 'zustand'

import type { AuthUser } from '../types/auth.types'

interface AuthStore {
  user: AuthUser | null

  setUser: (user: AuthUser | null) => void

  clearUser: () => void
}

const getInitialUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('uecg_user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: getInitialUser(),

  setUser: (user) => {
    set({ user })
    if (user) {
      localStorage.setItem('uecg_user', JSON.stringify(user))
    } else {
      localStorage.removeItem('uecg_user')
    }
  },

  clearUser: () => {
    set({ user: null })
    localStorage.removeItem('uecg_user')
    localStorage.removeItem('uecg_setup_token')
  },
}))

if (typeof window !== 'undefined') {
  // Sync state from other tabs
  window.addEventListener('storage', (event) => {
    if (event.key === 'uecg_user') {
      try {
        const user = event.newValue ? JSON.parse(event.newValue) : null
        useAuthStore.setState({ user })
      } catch {
        useAuthStore.setState({ user: null })
      }
    }
  })

  // Sync state from manual updates in the same window (e.g. login/logout via events)
  window.addEventListener('storage-update', () => {
    try {
      const raw = localStorage.getItem('uecg_user')
      const user = raw ? JSON.parse(raw) : null
      if (useAuthStore.getState().user?.id !== user?.id) {
        useAuthStore.setState({ user })
      }
    } catch {
      useAuthStore.setState({ user: null })
    }
  })
}
