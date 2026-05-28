export type QuizCategory = {
  id: string;
  title: string;
  emoji: string;
  count: number;
};

// ── Subject / Concept Stage Types ─────────────────────────────────────────────

export type Subject = {
  subjectId: number;
  name: string;
  conceptCount: number;
};

export type SubjectPage = {
  content: Subject[];
  hasNext: boolean;
  totalCount?: number;
};

export type ConceptStage = {
  conceptId: number;
  parentId: number | null;
  title: string;
  hasChild: boolean;
  isStudied: boolean;
};

// ── API Response Types ────────────────────────────────────────────────────────

export type ConceptDetailKey =
  | "definition"
  | "feature"
  | "comparison"
  | "specification"
  | "principle"
  | "best_practice";

export type ConceptDetail = {
  id: number;
  key: string;
  value: string;
};

export type SiblingConcept = {
  conceptId: number;
  conceptTitle: string;
  detailsList: ConceptDetail[];
};

export type QuizConceptData = {
  randomSeed: number;
  conceptId: number;
  conceptTitle: string;
  parentId: number | null;
  detailsList: ConceptDetail[];
  siblings: SiblingConcept[];
};

// 객관식
export type QuizQuestion = {
  id: string;
  categoryId: string;
  type?: "multiple-choice";
  question: string;
  options: string[];
  answerIndex: number;
  explanation?: string;
};

// 단답형
export type ShortAnswerQuestion = {
  id: string;
  categoryId: string;
  type: "short-answer";
  question: string;
  answer: string;
  explanation?: string;
};

// OX
export type OXQuestion = {
  id: string;
  categoryId: string;
  type: "ox";
  question: string;
  answer: boolean; // true = O, false = X
  explanation?: string;
};

// 매칭형 (3:3)
export type MatchingQuestion = {
  id: string;
  categoryId: string;
  type: "matching";
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

// ── Submit Result ─────────────────────────────────────────────────────────────

export type UserAnswer = {
  questionNumber: number;
  quizType: "MULTIPLE_CASE" | "OX" | "SHORT_ANSWER" | "MATCHING";
  answer: number | boolean | string | Record<string, number>;
};

export type SubmitResultRequest = {
  conceptId: number;
  randomSeed: number;
  isCompleted: boolean;
  userAnswers: UserAnswer[];
};

export type SubmitResultResponse = {
  valid: boolean;
  score: number;
  correctCount: number;
  totalCount: number;
  dotoriEarned: number;
  streak: {
    alreadyCheckedIn: boolean;
    currentStreak: number;
    longestStreak: number;
    bonusEarned: number;
    studyHistory: unknown[];
  };
};
