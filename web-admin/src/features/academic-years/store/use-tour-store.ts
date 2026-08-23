import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TourState {
  isActive: boolean
  currentStepIndex: number
  completedYears: Record<string, boolean> // { [yearId]: true }
  dismissedYears: Record<string, boolean> // { [yearId]: true }
  startTour: (fromStepIndex?: number) => void
  goToStep: (index: number) => void
  nextStep: () => void
  prevStep: () => void
  endTour: () => void
  completeTourForYear: (yearId: string) => void
  dismissTourForYear: (yearId: string) => void
  resetTourForYear: (yearId: string) => void
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      completedYears: {},
      dismissedYears: {},

      startTour: (fromStepIndex = 0) => {
        set({
          isActive: true,
          currentStepIndex: Math.max(0, fromStepIndex),
        })
      },

      goToStep: (index: number) => {
        set({ currentStepIndex: index })
      },

      nextStep: () => {
        set((state) => ({ currentStepIndex: state.currentStepIndex + 1 }))
      },

      prevStep: () => {
        set((state) => ({
          currentStepIndex: Math.max(0, state.currentStepIndex - 1),
        }))
      },

      endTour: () => {
        set({ isActive: false })
      },

      completeTourForYear: (yearId: string) => {
        set((state) => ({
          isActive: false,
          completedYears: { ...state.completedYears, [yearId]: true },
        }))
      },

      dismissTourForYear: (yearId: string) => {
        set((state) => ({
          isActive: false,
          dismissedYears: { ...state.dismissedYears, [yearId]: true },
        }))
      },

      resetTourForYear: (yearId: string) => {
        const state = get()
        const newCompleted = { ...state.completedYears }
        const newDismissed = { ...state.dismissedYears }
        delete newCompleted[yearId]
        delete newDismissed[yearId]
        set({
          completedYears: newCompleted,
          dismissedYears: newDismissed,
          currentStepIndex: 0,
          isActive: true,
        })
      },
    }),
    {
      name: 'uecg_director_tour_storage',
    }
  )
)
