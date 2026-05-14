import type { UserSummary } from "@/types/auth";
import api from "./axios";

export async function getMe(skipUnauthorized = false): Promise<UserSummary> {
  const { data } = await api.get(
    "/api/users/me",
    skipUnauthorized ? ({ _skipUnauthorizedCallback: true } as any) : undefined
  );
  return data;
}

export async function updateNickname(nickname: string): Promise<UserSummary> {
  const { data } = await api.patch("/api/users/me/nickname", { nickname });
  return data;
}
