import { create } from "zustand";
import type { AnyQuizQuestion, QuizResult } from "@/types/quiz";

type QuizState = {
  questions: AnyQuizQuestion[];
  currentIndex: number;
  isCorrect: (boolean | null)[];
  isFinished: boolean;
  results: QuizResult[];

  setQuestions: (questions: AnyQuizQuestion[]) => void;
  markAnswer: (correct: boolean) => void;
  nextQuestion: () => void;
  finishQuiz: (categoryId: string) => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  isCorrect: [],
  isFinished: false,
  results: [],

  setQuestions: (questions) =>
    set({
      questions,
      currentIndex: 0,
      isCorrect: Array(questions.length).fill(null),
      isFinished: false,
    }),

  markAnswer: (correct) => {
    const { currentIndex, isCorrect } = get();
    const updated = [...isCorrect];
    updated[currentIndex] = correct;
    set({ isCorrect: updated });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    } else {
      set({ isFinished: true });
    }
  },

  finishQuiz: (categoryId) => {
    const { isCorrect, results } = get();
    const correctCount = isCorrect.filter((v) => v === true).length;
    const result: QuizResult = {
      categoryId,
      totalQuestions: isCorrect.length,
      correctCount,
      earnedPoints: correctCount * 10,
      completedAt: new Date().toISOString(),
    };
    set({ results: [...results, result], isFinished: true });
  },

  resetQuiz: () =>
    set({ questions: [], currentIndex: 0, isCorrect: [], isFinished: false }),
}));
