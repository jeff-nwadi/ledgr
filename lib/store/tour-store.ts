import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface TourState {
  isActive: boolean;
  currentStepIndex: number;
  tourId: string; // e.g., 'owner-tour' | 'staff-tour'
  completedTours: Record<string, boolean>; // e.g. { 'owner-tour': true }

  // Actions
  startTour: (tourId?: string) => void;
  nextStep: (totalSteps: number) => void;
  prevStep: () => void;
  setStep: (index: number) => void;
  skipTour: () => void;
  completeTour: () => void;
  resetTour: (tourId?: string) => void;
  hasCompleted: (tourId: string) => boolean;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      tourId: "owner-tour",
      completedTours: {},

      startTour: (tourId = "owner-tour") => {
        set({
          isActive: true,
          currentStepIndex: 0,
          tourId,
        });
      },

      nextStep: (totalSteps: number) => {
        const { currentStepIndex } = get();
        if (currentStepIndex + 1 < totalSteps) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          get().completeTour();
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      setStep: (index: number) => {
        set({ currentStepIndex: index });
      },

      skipTour: () => {
        const { tourId, completedTours } = get();
        set({
          isActive: false,
          currentStepIndex: 0,
          completedTours: { ...completedTours, [tourId]: true },
        });
      },

      completeTour: () => {
        const { tourId, completedTours } = get();
        set({
          isActive: false,
          currentStepIndex: 0,
          completedTours: { ...completedTours, [tourId]: true },
        });
      },

      resetTour: (tourId = "owner-tour") => {
        const { completedTours } = get();
        const updated = { ...completedTours };
        delete updated[tourId];
        set({
          completedTours: updated,
          isActive: true,
          currentStepIndex: 0,
          tourId,
        });
      },

      hasCompleted: (tourId: string) => {
        return !!get().completedTours[tourId];
      },
    }),
    {
      name: "ledgr-tour-storage",
      partialize: (state) => ({ completedTours: state.completedTours }),
    }
  )
);
