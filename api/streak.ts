import axiosInstance from "./axios";

export type StreakResponse = {
  currentStreak: number;
  longestStreak: number;
  lastStudy: string;
  todayCheckedIn: boolean;
  protectorCount: number;
  studyHistory: string[];
};

export const getStreakStatus = async (): Promise<StreakResponse> => {
  const { data } = await axiosInstance.get<StreakResponse>("/api/streak");
  return data;
};
