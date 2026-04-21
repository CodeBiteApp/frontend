import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type StageState = {
  completedStages: string[];
  justCompletedStageId: string | null;
  triggerEating: (id: string) => void;
  confirmComplete: (id: string) => void;
};

export const useStageStore = create<StageState>()(
  persist(
    (set) => ({
      completedStages: [],
      justCompletedStageId: null,

      triggerEating: (id) =>
        set((state) =>
          state.completedStages.includes(id) ? {} : { justCompletedStageId: id }
        ),

      confirmComplete: (id) =>
        set((state) => ({
          completedStages: [...new Set([...state.completedStages, id])],
          justCompletedStageId: null,
        })),
    }),
    {
      name: "stage-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ completedStages: state.completedStages }),
    }
  )
);
