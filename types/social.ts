// GET /api/users/search 응답 아이템
export type UserSearchResult = {
  userId: number;
  userCode: string;
  nickname: string;
  currentStreak: number;
};

// POST/DELETE /api/follow/{targetUserId} 응답
export type FollowResponse = {
  targetUserId: number;
  isFollowing: boolean;
};
