import { create } from "zustand";
import type { QuizQuestion, QuizResult } from "@/types/quiz";

type QuizState = {
  questions: QuizQuestion[];
  currentIndex: number;
  selectedAnswers: (number | null)[];
  isFinished: boolean;
  results: QuizResult[];

  setQuestions: (questions: QuizQuestion[]) => void;
  selectAnswer: (index: number) => void;
  nextQuestion: () => void;
  finishQuiz: (categoryId: string) => void;
  resetQuiz: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  selectedAnswers: [],
  isFinished: false,
  results: [],

  setQuestions: (questions) =>
    set({ questions, currentIndex: 0, selectedAnswers: Array(questions.length).fill(null), isFinished: false }),

  selectAnswer: (index) => {
    const { currentIndex, selectedAnswers } = get();
    const updated = [...selectedAnswers];
    updated[currentIndex] = index;
    set({ selectedAnswers: updated });
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
    const { questions, selectedAnswers, results } = get();
    const correctCount = questions.reduce(
      (acc, q, i) => acc + (selectedAnswers[i] === q.answerIndex ? 1 : 0),
      0
    );
    const result: QuizResult = {
      categoryId,
      totalQuestions: questions.length,
      correctCount,
      earnedPoints: correctCount * 10,
      completedAt: new Date().toISOString(),
    };
    set({ results: [...results, result], isFinished: true });
  },

  resetQuiz: () =>
    set({ questions: [], currentIndex: 0, selectedAnswers: [], isFinished: false }),
}));
