import MockAdapter from "axios-mock-adapter";
import type { AxiosInstance } from "axios";
import { saveSecureStore } from "@/utils/secureStore";
import { STAGE_INFO } from "@/constants/stageInfo";

const MOCK_AUTH = {
  accessToken: "mock-access-token-dev",
  tokenType: "Bearer",
  expiresIn: 1500,
  user: { id: 1, userCode: "DEV001", email: "dev@test.com", nickname: "개발자" },
};

const MOCK_USER = {
  id: 1,
  userCode: "DEV001",
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

export async function seedMockSession() {
  await saveSecureStore("accessToken", MOCK_AUTH.accessToken);
}

// 가상 인메모리 북마크 목록 데이터
let mockBookmarks = [
  { conceptId: 2, title: "Java 프로그래밍이란", subjectName: "Java", hasChild: false },
  { conceptId: 14, title: "기본형", subjectName: "Java", hasChild: false },
  { conceptId: 15, title: "참조형", subjectName: "Java", hasChild: false },
];

export function setupMocks(api: AxiosInstance) {
  const mock = new MockAdapter(api, { onNoMatch: "passthrough" });

  mock.onPost("/api/auth/login").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/register").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/logout").reply(200);
  mock.onPost("/api/auth/refresh").reply(200, { accessToken: "mock-access-token-dev" });
  mock.onGet("/api/users/me").reply(200, MOCK_USER);

  // ── 북마크 Mock API ───────────────────────────────────────
  // GET: 북마크 목록 조회
  mock.onGet("/api/bookmarks").reply(config => {
    const subjectId = config.params?.subjectId;
    // 실제 필터링 로직 (mock이라 간단히 반환)
    if (subjectId) {
      // subjectId에 맞춰 필터링을 하고 싶다면 (우리는 현재 subjectName 필드만 사용하므로 그대로 전체를 주거나, subjectId에 맞춰 mockBookmarks를 가공)
      // Java(1번 과목이라고 가정)일 때만 반환하는 형태 등 가능
      return [200, mockBookmarks];
    }
    return [200, mockBookmarks];
  });

  // POST: 북마크 등록
  mock.onPost(/\/api\/bookmarks\/\d+/).reply(config => {
    const match = config.url?.match(/\/api\/bookmarks\/(\d+)/);
    const conceptId = match ? Number(match[1]) : 0;

    if (conceptId > 0 && !mockBookmarks.some(b => b.conceptId === conceptId)) {
      const info = STAGE_INFO[conceptId];
      mockBookmarks.push({
        conceptId,
        title: info ? info.title : `개념 ${conceptId}`,
        subjectName: "Java",
        hasChild: false,
      });
    }

    return [200, { conceptId, isMarked: true }];
  });

  // DELETE: 북마크 해제
  mock.onDelete(/\/api\/bookmarks\/\d+/).reply(config => {
    const match = config.url?.match(/\/api\/bookmarks\/(\d+)/);
    const conceptId = match ? Number(match[1]) : 0;

    mockBookmarks = mockBookmarks.filter(b => b.conceptId !== conceptId);

    return [200, { conceptId, isMarked: false }];
  });
}

