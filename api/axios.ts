import axios from "axios";
import { setupAuthInterceptors, setUnauthorizedHandler } from "@/api/authInterceptor";

export { setUnauthorizedHandler };

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  withCredentials: true,
  timeout: 10000,
});

setupAuthInterceptors(api);

export default api;
