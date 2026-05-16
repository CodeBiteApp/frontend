import {
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
} from "@/api/auth";
import { getMe } from "@/api/users";
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
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

const POSITION_KEY = "codebite_position";
const SOCIAL_LOGIN_KEY = "codebite_social_login";

type UserState = {
  user: User | null;
  isLoggedIn: boolean;
  hasOnboarded: boolean;
  isLoading: boolean;
  position: string | null;
  isSocialLogin: boolean;

  login: (body: LoginRequest) => Promise<void>;
  register: (body: RegisterRequest) => Promise<void>;
  completeSessionWithAccessToken: (accessToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<boolean>;
  completeOnboarding: (position: string) => void;
  setUnauthorized: () => void;
  setUser: (user: User) => void;
  refreshUser: () => Promise<void>;
};

// AsyncStorage에서 position, isSocialLogin 읽기
async function readLocalSession() {
  const results = await AsyncStorage.multiGet([
    POSITION_KEY,
    SOCIAL_LOGIN_KEY,
  ]).catch(() => []);
  const position =
    results.find(([k]) => k === POSITION_KEY)?.[1] ?? "자바 개발자";
  const isSocialLogin =
    results.find(([k]) => k === SOCIAL_LOGIN_KEY)?.[1] === "true";
  return { position, isSocialLogin };
}

// 서버에서 유저 정보 + 로컬 세션 합쳐서 반환
async function fetchUserWithSession(skipUnauthorized = false) {
  const user = await getMe(skipUnauthorized);
  const local = await readLocalSession();
  return { user, ...local };
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isLoggedIn: false,
  hasOnboarded: false,
  isLoading: true,
  position: null,
  isSocialLogin: false,

  login: async (body) => {
    set({ isLoading: true });
    try {
      const response = await loginApi(body);
      await saveSecureStore("accessToken", response.accessToken);
      await AsyncStorage.setItem(SOCIAL_LOGIN_KEY, "false");
      const { position } = await readLocalSession();
      set({
        user: response.user,
        isLoggedIn: true,
        isSocialLogin: false,
        position,
        hasOnboarded: !!position,
      });
      scheduleTokenRefresh();
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (body) => {
    set({ isLoading: true });
    try {
      const response = await registerApi(body);
      console.log("[register] 서버 응답:", JSON.stringify(response));

      if (!response.accessToken) {
        throw new Error(
          `accessToken 없음. 실제 응답: ${JSON.stringify(response)}`,
        );
      }

      await saveSecureStore("accessToken", response.accessToken);
      await AsyncStorage.setItem(SOCIAL_LOGIN_KEY, "false");
      const { position } = await readLocalSession();
      set({
        user: response.user,
        isLoggedIn: true,
        isSocialLogin: false,
        position,
        hasOnboarded: !!position,
      });
      scheduleTokenRefresh();
    } finally {
      set({ isLoading: false });
    }
  },

  completeSessionWithAccessToken: async (accessToken) => {
    set({ isLoading: true });
    try {
      await saveSecureStore("accessToken", accessToken);
      await AsyncStorage.setItem(SOCIAL_LOGIN_KEY, "true");
      const { user, position } = await fetchUserWithSession();
      set({
        user,
        isLoggedIn: true,
        isSocialLogin: true,
        position,
        hasOnboarded: !!position,
      });
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
      await AsyncStorage.removeItem(SOCIAL_LOGIN_KEY).catch(() => {});
      clearTokenRefreshTimer();
      set({ user: null, isLoggedIn: false, isSocialLogin: false });
    }
  },

  restoreSession: async () => {
    set({ isLoading: true });
    try {
      const token = await getSecureStore("accessToken");
      if (!token) return false;

      const { user, position, isSocialLogin } =
        await fetchUserWithSession(true);
      set({
        user,
        isLoggedIn: true,
        isSocialLogin,
        position,
        hasOnboarded: !!position,
      });
      scheduleTokenRefresh();
      return true;
    } catch {
      await deleteSecureStore("accessToken").catch(() => {});
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: (position) => {
    AsyncStorage.multiSet([
      [POSITION_KEY, position],
    ]).catch(() => {});
    set({ hasOnboarded: true, position });
  },

  setUnauthorized: () => {
    clearTokenRefreshTimer();
    set({ user: null, isLoggedIn: false });
  },

  setUser: (user) => set({ user }),

  refreshUser: async () => {
    if (!get().isLoggedIn) return;
    try {
      const user = await getMe(true);
      set({ user });
    } catch (e) {
      console.error("[refreshUser] Failed to refresh user data", e);
    }
  },
}));
