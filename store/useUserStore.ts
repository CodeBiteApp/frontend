import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "@/api/auth";
import { getMe } from "@/api/users";
import type { LoginRequest, RegisterRequest, UserSummary } from "@/types/auth";
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import {
  clearTokenRefreshTimer,
  scheduleTokenRefresh,
} from "@/utils/tokenRefresh";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const POSITION_KEY = "codebite_position";
const STREAK_KEY = "codebite_streak";

type UserState = {
  user: UserSummary | null;
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  isLoading: boolean;
  position: string | null;
  streak: number;

  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  completeSessionWithAccessToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  completeOnboarding: (position: string) => void;
  setUnauthorized: () => void;
};

// AsyncStorage에서 position, streak 읽기
async function readLocalSession() {
  const results = await AsyncStorage.multiGet([POSITION_KEY, STREAK_KEY]).catch(
    () => [],
  );
  const position = results.find(([k]) => k === POSITION_KEY)?.[1] ?? null;
  const streak = Number(results.find(([k]) => k === STREAK_KEY)?.[1]) || 0;
  return { position, streak };
}

// 서버에서 유저 정보 + 로컬 세션 합쳐서 반환
async function fetchUserWithSession(skipUnauthorized = false) {
  const user = await getMe(skipUnauthorized);
  const local = await readLocalSession();
  return { user, ...local };
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoggedIn: false,
  hasOnboarded: false,
  isLoading: true,
  position: null,
  streak: 0,

  login: async (body) => {
    set({ isLoading: true });
    try {
      const response = await loginApi(body);
      await saveSecureStore("accessToken", response.accessToken);
      const { position, streak } = await readLocalSession();
      set({ user: response.user, isLoggedIn: true, position, streak });
      scheduleTokenRefresh();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (body) => {
    set({ isLoading: true });
    try {
      const response = await registerApi(body);
      await saveSecureStore("accessToken", response.accessToken);
      const { position, streak } = await readLocalSession();
      set({ user: response.user, isLoggedIn: true, position, streak });
      scheduleTokenRefresh();
    } finally {
      set({ isLoading: false });
    }
  },

  // OAuth 로그인 전용 — 외부(OAuth)에서 받은 accessToken으로 세션을 완성하는 함수
  completeSessionWithAccessToken: async (accessToken) => {
    set({ isLoading: true });
    try {
      await saveSecureStore("accessToken", accessToken);
      const { user, position, streak } = await fetchUserWithSession();
      set({ user, isLoggedIn: true, position, streak });
      scheduleTokenRefresh();
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } finally {
      await deleteSecureStore("accessToken");
      clearTokenRefreshTimer();
      set({ user: null, isLoggedIn: false });
    }
  },

  // 앱 재시작 시 SecureStore에 토큰이 있으면 세션 복원
  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await getSecureStore("accessToken");
      if (!token) return false;

      const { user, position, streak } = await fetchUserWithSession(true);
      set({ user, isLoggedIn: true, position, streak });
      scheduleTokenRefresh();
      return true;
    } catch {
      await deleteSecureStore("accessToken").catch(() => {});
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  // 온보딩 완료 시 직군과 streak(1로 초기화)을 AsyncStorage에 저장하고 상태 반영
  completeOnboarding: (position) => {
    const streak = 1;
    AsyncStorage.multiSet([
      [POSITION_KEY, position],
      [STREAK_KEY, String(streak)],
    ]).catch(() => {});
    set({ hasOnboarded: true, position, streak });
  },

  // 토큰 만료 등으로 401 발생 시 강제 로그아웃 처리
  setUnauthorized: () => {
    clearTokenRefreshTimer();
    set({ user: null, isLoggedIn: false });
  },
}));
