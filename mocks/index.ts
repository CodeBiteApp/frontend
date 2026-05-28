import MockAdapter from "axios-mock-adapter";
import type { AxiosInstance } from "axios";
import { saveSecureStore } from "@/utils/secureStore";
import { CHAPTER_COLORS, CHAPTER_LETTERS, CHAPTER_NAMES, CHAPTER_STAGES, STAGE_INFO } from "@/constants/stageInfo";
import type { ConceptStage, Subject } from "@/types/quiz";

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

// 서버 isStudied 상태 추적 (목 전용 인메모리)
const studiedConceptIds = new Set<number>();

// subjects: 8개 Java 챕터(A-H)를 subject로 매핑
const MOCK_SUBJECTS: Subject[] = CHAPTER_LETTERS.map((letter, i) => ({
  subjectId: i + 1,
  name: CHAPTER_NAMES[i],
  conceptCount: CHAPTER_STAGES[letter].length,
}));

// 챕터 인덱스 → concepts 변환 (parentId 없음 — 평면 구조)
function buildConceptsForSubject(subjectId: number): ConceptStage[] {
  const letter = CHAPTER_LETTERS[subjectId - 1];
  if (!letter) return [];
  return CHAPTER_STAGES[letter].map((conceptId) => ({
    conceptId,
    parentId: null,
    title: STAGE_INFO[conceptId]?.title ?? `스테이지 ${conceptId}`,
    hasChild: false,
    isStudied: studiedConceptIds.has(conceptId),
  }));
}

// 북마크 인메모리 목록
let mockBookmarks = [
  { conceptId: 2, title: "Java 프로그래밍이란", subjectName: "Java 기초", hasChild: false },
  { conceptId: 14, title: "기본형", subjectName: "Java 기초", hasChild: false },
  { conceptId: 15, title: "참조형", subjectName: "Java 기초", hasChild: false },
];

export async function seedMockSession() {
  await saveSecureStore("accessToken", MOCK_AUTH.accessToken);
}

export function setupMocks(api: AxiosInstance) {
  const mock = new MockAdapter(api, { onNoMatch: "passthrough" });

  // ── 인증 ──────────────────────────────────────────────────────
  mock.onPost("/api/auth/login").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/register").reply(200, MOCK_AUTH);
  mock.onPost("/api/auth/logout").reply(200);
  mock.onPost("/api/auth/refresh").reply(200, { accessToken: "mock-access-token-dev" });
  mock.onGet("/api/users/me").reply(200, MOCK_USER);

  // ── 챕터(Subject) 목록 ────────────────────────────────────────
  mock.onGet("/api/subjects").reply(200, MOCK_SUBJECTS);

  // ── 챕터별 스테이지(Concept) 목록 ─────────────────────────────
  mock.onGet(/\/api\/subjects\/(\d+)\/concepts/).reply((config) => {
    const match = config.url?.match(/\/api\/subjects\/(\d+)\/concepts/);
    const subjectId = match ? Number(match[1]) : 0;
    return [200, buildConceptsForSubject(subjectId)];
  });

  // ── 퀴즈 결과 제출 (isStudied 갱신 포함) ───────────────────────
  mock.onPost("/api/quiz/submit-result").reply((config) => {
    const body = JSON.parse(config.data ?? "{}");
    if (body.isCompleted && body.conceptId) {
      studiedConceptIds.add(Number(body.conceptId));
    }
    return [
      200,
      {
        valid: true,
        score: 100,
        correctCount: body.userAnswers?.length ?? 0,
        totalCount: body.userAnswers?.length ?? 0,
        dotoriEarned: 12,
        streak: {
          alreadyCheckedIn: false,
          currentStreak: 6,
          longestStreak: 10,
          bonusEarned: 0,
          studyHistory: [],
        },
      },
    ];
  });

  // ── 북마크 ─────────────────────────────────────────────────────
  mock.onGet("/api/bookmarks").reply(() => [200, mockBookmarks]);

  mock.onPost(/\/api\/bookmarks\/\d+/).reply((config) => {
    const match = config.url?.match(/\/api\/bookmarks\/(\d+)/);
    const conceptId = match ? Number(match[1]) : 0;
    if (conceptId > 0 && !mockBookmarks.some((b) => b.conceptId === conceptId)) {
      const info = STAGE_INFO[conceptId];
      mockBookmarks.push({
        conceptId,
        title: info ? info.title : `개념 ${conceptId}`,
        subjectName: "Java 기초",
        hasChild: false,
      });
    }
    return [200, { conceptId, isMarked: true }];
  });

  mock.onDelete(/\/api\/bookmarks\/\d+/).reply((config) => {
    const match = config.url?.match(/\/api\/bookmarks\/(\d+)/);
    const conceptId = match ? Number(match[1]) : 0;
    mockBookmarks = mockBookmarks.filter((b) => b.conceptId !== conceptId);
    return [200, { conceptId, isMarked: false }];
  });
}
