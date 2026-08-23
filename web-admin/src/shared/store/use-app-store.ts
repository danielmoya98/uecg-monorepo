import { create } from 'zustand'

interface AppState {
  selectedYear: string | null
  selectedYearId: string | null
  setSelectedYear: (year: string, id?: string) => void
  setSelectedYearId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedYear: null,
  selectedYearId: null,
  setSelectedYear: (year, id) =>
    set((state) => ({
      selectedYear: year,
      selectedYearId: id !== undefined ? id : state.selectedYearId,
    })),
  setSelectedYearId: (id) => set({ selectedYearId: id }),
}))
