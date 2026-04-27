import api from "@/api/axios";
import { deleteSecureStore, saveSecureStore } from "./secureStore";

const REFRESH_INTERVAL_MS = 25 * 60 * 1000; // 25분

// 타이머 번호가 리턴됨. // ex) 42번 타이머
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleTokenRefresh() {
  clearTokenRefreshTimer();

  refreshTimer = setTimeout(async () => {
    try {
      const { data } = await api.post("/api/auth/refresh");
      await saveSecureStore("accessToken", data.accessToken);
      scheduleTokenRefresh(); // 갱신 후, 다시 성공 예약
    } catch {
      //refresh = 실패 = unauthorizedCallback이 처리
      await deleteSecureStore("accessToken");
    }
  }, REFRESH_INTERVAL_MS);
}

// 타이머 클리어 clearTimeout = 42번 타이머
export function clearTokenRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
