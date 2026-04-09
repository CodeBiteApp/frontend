import { getSecureStore } from "@/utils/secureStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL, // env에 있는 백엔드 주소
  withCredentials: true, // refreshToken 쿠키 전송 필수.
  timeout: 1000,
});

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

export default api;
