import { create } from "zustand";
import type { AnyQuizQuestion, QuizResult, UserAnswer } from "@/types/quiz";

type QuizState = {
  questions: AnyQuizQuestion[];
  currentIndex: number;
  isCorrect: (boolean | null)[];
  isFinished: boolean;
  results: QuizResult[];

  conceptId: number | null;
  randomSeed: number | null;
  userAnswers: UserAnswer[];

  isRetrying: boolean;
  retryQueue: AnyQuizQuestion[];
  retryTotal: number;
  retryCorrectCount: number;
  retryAnswered: boolean;
  retryIsCorrect: boolean | null;

  setQuestions: (questions: AnyQuizQuestion[]) => void;
  markAnswer: (correct: boolean) => void;
  nextQuestion: () => void;
  finishQuiz: (categoryId: string) => void;
  resetQuiz: () => void;

  setConceptMeta: (conceptId: number, randomSeed: number) => void;
  recordAnswer: (questionNumber: number, quizType: UserAnswer["quizType"], answer: UserAnswer["answer"]) => void;

  enterRetry: () => void;
  markRetryAnswer: (correct: boolean) => void;
  resetRetryAnswer: () => void;
  nextRetryQuestion: () => void;
};

export const useQuizStore = create<QuizState>((set, get) => ({
  questions: [],
  currentIndex: 0,
  isCorrect: [],
  isFinished: false,
  results: [],

  conceptId: null,
  randomSeed: null,
  userAnswers: [],

  isRetrying: false,
  retryQueue: [],
  retryTotal: 0,
  retryCorrectCount: 0,
  retryAnswered: false,
  retryIsCorrect: null,

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

  setConceptMeta: (conceptId, randomSeed) => set({ conceptId, randomSeed }),

  recordAnswer: (questionNumber, quizType, answer) => {
    const { userAnswers } = get();
    set({ userAnswers: [...userAnswers, { questionNumber, quizType, answer }] });
  },

  resetQuiz: () =>
    set({
      questions: [],
      currentIndex: 0,
      isCorrect: [],
      isFinished: false,
      conceptId: null,
      randomSeed: null,
      userAnswers: [],
      isRetrying: false,
      retryQueue: [],
      retryTotal: 0,
      retryCorrectCount: 0,
      retryAnswered: false,
      retryIsCorrect: null,
    }),

  enterRetry: () => {
    const { questions, isCorrect } = get();
    const wrongQuestions = questions.filter((_, i) => isCorrect[i] === false);
    set({
      isRetrying: true,
      retryQueue: wrongQuestions,
      retryTotal: wrongQuestions.length,
      retryCorrectCount: 0,
      retryAnswered: false,
      retryIsCorrect: null,
    });
  },

  markRetryAnswer: (correct) => {
    set({ retryAnswered: true, retryIsCorrect: correct });
  },

  resetRetryAnswer: () => {
    set({ retryAnswered: false, retryIsCorrect: null });
  },

  nextRetryQuestion: () => {
    const { retryQueue, retryCorrectCount } = get();
    const newQueue = retryQueue.slice(1);
    const newCorrectCount = retryCorrectCount + 1;
    if (newQueue.length === 0) {
      set({
        isRetrying: false,
        isFinished: true,
        retryQueue: [],
        retryCorrectCount: newCorrectCount,
        retryAnswered: false,
        retryIsCorrect: null,
      });
    } else {
      set({
        retryQueue: newQueue,
        retryCorrectCount: newCorrectCount,
        retryAnswered: false,
        retryIsCorrect: null,
      });
    }
  },
}));
