import { deleteSecureStore, getSecureStore, saveSecureStore } from "@/utils/secureStore";
import type { AxiosInstance } from "axios";

let unauthorizedCallback: (() => void) | null = null;

export const setUnauthorizedHandler = (fn: () => void) => {
  unauthorizedCallback = fn;
};

let isRefreshing = false;
type PendingItem = { resolve: (token: string) => void; reject: (error: unknown) => void };
let pendingQueue: PendingItem[] = [];

const flushQueue = (error: unknown, token: string | null = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

export const setupAuthInterceptors = (api: AxiosInstance) => {
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
      const originalRequest = error.config;

      if (
        error.response?.status === 401 &&
        !originalRequest.url?.includes("/api/auth/refresh")
      ) {
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
            unauthorizedCallback?.();
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
