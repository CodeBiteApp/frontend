import api from "@/api/axios";
import { LoginRequest } from "@/types/auth";

// 로그인
async function login(body: LoginRequest) {
  const { data } = await api.post("/api/login", body);

  return data;
}

export { login };
