import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "@/api/auth";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";
import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import {
  clearTokenRefreshTimer,
  scheduleTokenRefresh,
} from "@/utils/tokenRefresh";
import { create } from "zustand";

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  isLoading: boolean;

  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>; // 앱 재시작 시 호출
  completeOnboarding: () => void;
  setUnauthorized: () => void; // interceptor에서 호출
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  hasOnboarded: false,
  isLoading: false,

  login: async (body) => {
    set({ isLoading: true });
    try {
      const response = await loginApi(body);
      await saveSecureStore("accessToken", response.accessToken);
      set({ user: response.user as any, isLoggedIn: true });
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
      set({ user: response.user as any, isLoggedIn: true });
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

  restoreSession: async () => {
    const token = await getSecureStore("accessToken");
    if (!token) return false;

    try {
      // GET /api/users/me 로 유저 정보 복원
      const api = (await import("@/api/axios")).default;
      const { data } = await api.get("/api/users/me");
      set({ user: data, isLoggedIn: true });
      scheduleTokenRefresh();
      return true;
    } catch {
      await deleteSecureStore("accessToken");
      return false;
    }
  },

  completeOnboarding: () => set({ hasOnboarded: true }),

  setUnauthorized: () => {
    clearTokenRefreshTimer();
    set({ user: null, isLoggedIn: false });
  },
}));
