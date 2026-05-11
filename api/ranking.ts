import api from "@/api/axios";
import type { RankingResponse } from "@/types/ranking";

/**
 * GET /api/ranking/global
 * 전체 유저 스트릭 랭킹 조회
 */
export async function getGlobalRanking(
  limit = 50,
  offset = 0
): Promise<RankingResponse> {
  const res = await api.get<RankingResponse>("/api/ranking/global", {
    params: { limit, offset },
  });
  return res.data;
}

/**
 * GET /api/ranking/following
 * 내가 팔로잉하는 유저 + 나 자신 대상 스트릭 랭킹 조회
 */
export async function getFollowingRanking(): Promise<RankingResponse> {
  const res = await api.get<RankingResponse>("/api/ranking/following");
  return res.data;
}
