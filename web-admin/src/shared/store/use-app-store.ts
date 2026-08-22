import { create } from 'zustand'

interface AppState {
  selectedYear: string | null
  setSelectedYear: (year: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: null, // Inicializado en null, el selector del TopNav se encargará de hidratarlo
  setSelectedYear: (year) => set({ selectedYear: year }),
}))
