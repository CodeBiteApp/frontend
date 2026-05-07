export type QuizCategory = {
  id: string;
  title: string;
  emoji: string;
  count: number;
};

// 객관식
export type QuizQuestion = {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

// 단답형
export type ShortAnswerQuestion = {
  id: string;
  categoryId: string;
  question: string;
  answer: string;
  explanation?: string;
};

// OX
export type OXQuestion = {
  id: string;
  categoryId: string;
  question: string;
  answer: boolean; // true = O, false = X
  explanation?: string;
};

// 매칭형 (3:3)
export type MatchingQuestion = {
  id: string;
  categoryId: string;
  question: string;
  leftItems: string[];
  rightItems: string[]; // 표시 순서 (셔플 가능)
  correctPairs: Record<number, number>; // leftIndex -> rightIndex
  explanation?: string;
};

export type AnyQuizQuestion =
  | QuizQuestion
  | ShortAnswerQuestion
  | OXQuestion
  | MatchingQuestion;

export type QuizResult = {
  categoryId: string;
  totalQuestions: number;
  correctCount: number;
  earnedPoints: number;
  completedAt: string;
};

export type RankingEntry = {
  rank: number;
  name: string;
  score: number;
};

export type Reward = {
  id: string;
  title: string;
  description: string;
  points: number;
  unlocked: boolean;
};
