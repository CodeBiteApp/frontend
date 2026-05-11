export type RankUser = {
  rank: number;
  name: string;
  score: number;
  dotori: number;
  isMe?: boolean;
};

export const MOCK_RANKING: RankUser[] = [
  { rank: 1,  name: "퀴즈왕",     score: 4280, dotori: 980 },
  { rank: 2,  name: "지식인",     score: 3970, dotori: 870 },
  { rank: 3,  name: "천재소년",   score: 3650, dotori: 760 },
  { rank: 4,  name: "공부벌레",   score: 3100, dotori: 650 },
  { rank: 5,  name: "알고왕",     score: 2880, dotori: 540 },
  { rank: 6,  name: "코딩마스터", score: 2470, dotori: 490 },
  { rank: 7,  name: "나",         score: 2200, dotori: 300, isMe: true },
  { rank: 8,  name: "열공중",     score: 1950, dotori: 270 },
  { rank: 9,  name: "뉴비",       score: 1340, dotori: 180 },
  { rank: 10, name: "도전자",     score:  890, dotori: 120 },
];

export const MOCK_FRIENDS: RankUser[] = [
  { rank: 1, name: "나",    score: 2200, dotori: 300, isMe: true },
  { rank: 2, name: "친구A", score: 1980, dotori: 260 },
  { rank: 3, name: "친구B", score: 1750, dotori: 210 },
  { rank: 4, name: "친구C", score: 1400, dotori: 170 },
  { rank: 5, name: "친구D", score:  980, dotori: 110 },
];

export const TOP3_COLORS  = ["#FFC800", "#C0C0C0", "#CD7F32"] as const;
export const TOP3_LABELS  = ["1st", "2nd", "3rd"] as const;
export const TOP3_HEIGHTS = [110, 80, 60] as const;
