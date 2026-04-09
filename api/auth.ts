import api from "@/api/axios";
import { AuthResponse, LoginRequest, RegisterRequest } from "@/types/auth";

// 로그인
async function login(body: LoginRequest): Promise<AuthResponse> {
  const { data } = await api.post("/api/auth/login", body);

  return data;
}

// 회원가입
async function register(body: RegisterRequest): Promise<AuthResponse> {
  const { data } = await api.post("/api/auth/register", body);

  return data;
}

export { login, register };
