import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // env에 있는 백엔드 주소
  withCredentials: true, // refreshToken 쿠키 전송 필수.
  timeout: 10000,
});

// 처음에는 callback이 없음.
let unauthorizedCallback: (() => void) | null = null;

// 나중에 앱 어딘가에서 등록
export const setUnauthorizedHandler = (fn: () => void) => {
  unauthorizedCallback = fn;
};

// 요청 인터럽터 : 모든 요청에 SecureStore의 최신 토큰 추가
api.interceptors.request.use(
  async (config) => {
    const token = await getSecureStore("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 응답 인터셉터 : 401 감지 -> refresh -> 재시도
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401이고, 아직 재시도 안 했을 때만 (무한루프 방지)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // — refresh 도중 401 오면 바로 catch로 빠지게
      originalRequest._retry = true;

      try {
        // refreshToken은 쿠키로 자동 전송됨.
        const { data } = await api.post("/api/auth/refresh");
        await saveSecureStore("accessToken", data.accessToken);

        // 실패했던 원래 요청 재시도
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch {
        // refresh도 실패 -> 로그아웃 처리
        await deleteSecureStore("accessToken");
        unauthorizedCallback?.(); // router.replace("/(auth)/login");
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
