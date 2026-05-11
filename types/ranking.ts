// GET /api/ranking/global, /api/ranking/following 응답 타입

// 랭킹 목록 각 항목
export type RankingEntry = {
  rank: number;
  userId: number;
  nickname: string;
  currentStreak: number;
  longestStreak: number;
};

// 랭킹 API 최상위 응답
export type RankingResponse = {
  myRank: number | null;
  rankings: RankingEntry[];
};
