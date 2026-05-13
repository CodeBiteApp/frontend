import {
  deleteSecureStore,
  getSecureStore,
  saveSecureStore,
} from "@/utils/secureStore";
import type { AxiosInstance } from "axios";

/**
 * 401 최종 실패시 실행할 함수 저장
 */
let unauthorizedCallback: (() => void) | null = null;

/**
 * 401 인증 실패 시 실행할 콜백 함수를 등록합니다.
 * 토큰 갱신도 실패한 경우 호출되며, 주로 로그인 페이지로 리다이렉트하는 데 사용합니다.
 * @param fn - 인증 실패 시 실행할 콜백 함수
 * @example
 * setUnauthorizedHandler(() => {
 *   router.replace("/login");
 * });
 */
export const setUnauthorizedHandler = (fn: () => void) => {
  unauthorizedCallback = fn;
};

// refresh 방지 상태
let isRefreshing = false;

// refresh 대기 큐
type PendingItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};
let pendingQueue: PendingItem[] = [];

// refresh 끝나면 대기 중인 요청 처리
const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

export const setupAuthInterceptors = (api: AxiosInstance) => {
  // api.intercepotors.request.use() : 모든 요청 보내기 전에 실행됨.
  api.interceptors.request.use(
    async (config) => {
      const token = await getSecureStore("accessToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      return config;
    },
    (error) => Promise.reject(error),
  );

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      /**
       * originalRequest : 에러났던 url 경로
       */
      const originalRequest = error.config;
      const authOnlyEndpoints = [
        "/api/auth/refresh",
        "/api/auth/login",
        "/api/auth/register",
      ];

      /**
       *  계정 관련 엔드포인트면 true 아니면 False
       */
      const isAuthEndpoint = authOnlyEndpoints.some((path) =>
        originalRequest.url?.includes(path),
      );

      // 401 에러 && 계정 관련 엔드포인트가 아니면
      if (error.response?.status === 401 && !isAuthEndpoint) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            pendingQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        isRefreshing = true;

        try {
          const { data } = await api.post("/api/auth/refresh");
          await saveSecureStore("accessToken", data.accessToken);
          flushQueue(null, data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          flushQueue(refreshError);
          await deleteSecureStore("accessToken");
          if (!originalRequest._skipUnauthorizedCallback) {
            unauthorizedCallback?.(); // 강제 로그아웃 화면 이동
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};
