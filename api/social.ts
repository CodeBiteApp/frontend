import api from "@/api/axios";
import type { FollowResponse, UserSearchResult } from "@/types/social";

/** GET /api/users/search
 *  - nickname: 필수 (공백이면 호출하지 말 것)
 *  - userCode: 선택. 값이 없으면 파라미터 생략 → 목록 모드
 *  - limit: 선택 (기본 20)
 */
export async function searchUsers(params: {
  nickname: string;
  userCode?: string;
  limit?: number;
}): Promise<UserSearchResult[]> {
  const query: Record<string, string | number> = {
    nickname: params.nickname,
    limit: params.limit ?? 20,
  };
  if (params.userCode && params.userCode.trim()) {
    query.userCode = params.userCode.trim();
  }
  const res = await api.get<UserSearchResult[]>("/api/users/search", {
    params: query,
  });
  return res.data;
}

/** POST /api/follow/{targetUserId} */
export async function followUser(
  targetUserId: number
): Promise<FollowResponse> {
  const res = await api.post<FollowResponse>(
    `/api/follow/${targetUserId}`
  );
  return res.data;
}

/** DELETE /api/follow/{targetUserId} */
export async function unfollowUser(
  targetUserId: number
): Promise<FollowResponse> {
  const res = await api.delete<FollowResponse>(
    `/api/follow/${targetUserId}`
  );
  return res.data;
}
