import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AnyQuizQuestion } from "@/types/quiz";

type QuizPoolState = {
  questionPools: Record<number, AnyQuizQuestion[]>;
  initPool: (conceptId: number, questions: AnyQuizQuestion[]) => void;
  popFromPool: (conceptId: number, count: number) => AnyQuizQuestion[];
  clearPool: (conceptId: number) => void;
};

export const useQuizPoolStore = create<QuizPoolState>()(
  persist(
    (set, get) => ({
      questionPools: {},

      initPool: (conceptId, questions) =>
        set((state) => ({
          questionPools: { ...state.questionPools, [conceptId]: questions },
        })),

      popFromPool: (conceptId, count) => {
        const pool = get().questionPools[conceptId] ?? [];
        if (pool.length === 0) return [];

        const taken: AnyQuizQuestion[] = [];
        const usedCategories = new Set<string>();
        const remaining: AnyQuizQuestion[] = [];

        for (const q of pool) {
          if (taken.length < count && !usedCategories.has(q.categoryId)) {
            usedCategories.add(q.categoryId);
            taken.push(q);
          } else {
            remaining.push(q);
          }
        }

        set((state) => ({
          questionPools: { ...state.questionPools, [conceptId]: remaining },
        }));
        return taken;
      },

      clearPool: (conceptId) =>
        set((state) => {
          const updated = { ...state.questionPools };
          delete updated[conceptId];
          return { questionPools: updated };
        }),
    }),
    {
      name: "quiz-pool-storage",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ questionPools: state.questionPools }),
    }
  )
);
