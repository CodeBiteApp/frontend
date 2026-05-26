import {
  setUnauthorizedHandler,
  setupAuthInterceptors,
} from "@/api/authInterceptor";
import axios from "axios";

export { setUnauthorizedHandler };

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
});

setupAuthInterceptors(api);

// ── Mock (제거 시 import 포함 아래 4줄 삭제) ──────────────
// if (process.env.EXPO_PUBLIC_MOCK_AUTH === "true") {
//   setupMocks(api);
// }
// ─────────────────────────────────────────────────────────

export default api;
