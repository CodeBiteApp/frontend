export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number; // 초 단위 (1500 = 25분)
  user: User;
};

export type User = {
  id: number;
  userCode: string;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  currentStreak: number;
  longestStreak: number;
  dotori: number;
  protector: number;
  equippedBanner: string | null;
  studiedConceptCount: number;
  followingCount: number;
  followerCount: number;
};

export type UserSummary = {
  id: number;
  userCode: string;
  email: string;
  nickname: string;
};
