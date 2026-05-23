import api from "./axios";

export type StreakRestoreResponse = {
  currentStreak: number;
  protector: number;
  lastStudy: string | null;
};

export async function restoreStreak(): Promise<StreakRestoreResponse> {
  const { data } = await api.post("/api/streak/restore");
  return data;
}

export async function resetStreak(): Promise<StreakRestoreResponse> {
  const { data } = await api.post("/api/streak/reset");
  return data;
}
