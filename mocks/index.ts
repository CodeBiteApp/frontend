import MockAdapter from "axios-mock-adapter";
import type { AxiosInstance } from "axios";

const MOCK_AUTH = {
  accessToken: "mock-access-token-dev",
  tokenType: "Bearer",
  expiresIn: 1500,
  user: { id: 1, email: "dev@test.com", nickname: "개발자" },
};

const MOCK_USER = {
  id: 1,
  email: "dev@test.com",
  nickname: "개발자",
  profileImageUrl: null,
  currentStreak: 5,
  longestStreak: 10,
  cookie: 100,
  protector: 3,
  equippedBanner: null,
  studiedConceptCount: 42,
  followingCount: 7,
  followerCount: 12,
};

export function setupMocks(api: AxiosInstance) {
  const mock = new MockAdapter(api, { onNoMatch: "passthrough" });

  mock.onPost("/api/auth/login").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/register").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/logout").reply(200);
  mock.onPost("/api/auth/refresh").reply(200, { accessToken: "mock-access-token-dev" });
  mock.onGet("/api/users/me").reply(200, MOCK_USER);
}
