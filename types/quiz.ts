export type QuizCategory = {
  id: string;
  title: string;
  emoji: string;
  count: number;
};

export type QuizQuestion = {
  id: string;
  categoryId: string;
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

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
