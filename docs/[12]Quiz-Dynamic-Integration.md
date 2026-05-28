# [12] 퀴즈 동적화 통합 작업 세션

> 작업일: 2026-05-28  
> 브랜치: `feature/quiz-fix`  
> 목적: `STAGE_INFO` 하드코딩 제거 → `GET /api/subjects`, `GET /api/subjects/{id}/concepts` API 기반 동적화

---

## 1. 배경

기존 홈 화면과 퀴즈 화면은 `constants/stageInfo.ts`의 `STAGE_INFO` (84개 스테이지 하드코딩) 에 의존하고 있었음.  
`[11]Quiz-Response.md` API 스펙에 맞춰 서버 데이터 기반으로 전환함.

### 기존 문제점

| 항목 | 기존 상태 |
|---|---|
| 챕터/스테이지 목록 | `STAGE_INFO` 84개 하드코딩 |
| 완료 여부 (`isStudied`) | 로컬 `AsyncStorage` (`completedStages`) 기준 |
| 퀴즈 헤더 타이틀 | `STAGE_INFO[id].title` 하드코딩 |
| 액센트 색 | `STAGE_INFO[id].chapter` → 알파벳 인덱스 → 색 배열 |
| 스크롤 breakpoint | `CHAPTER_LETTERS` × `CHAPTER_STAGES` 정적 계산 |

---

## 2. API 연동 흐름 (변경 후)

```
앱 포커스
  ↓
GET /api/subjects
  → useSubjectStore.subjects[]  (챕터 목록)
  ↓ (병렬)
GET /api/subjects/{id}/concepts × N
  → useSubjectStore.conceptsMap{}  (챕터별 스테이지 + isStudied)
  ↓
홈 화면: subjects 순서대로 동적 렌더
  ↓ 스테이지 클릭
GET /api/quiz/concept-data?conceptId={id}
  → 퀴즈 생성 (conceptTitle 헤더 표시)
  ↓ 퀴즈 완료
POST /api/quiz/submit-result
  → dotoriEarned, streak 반영
  ↓ 홈 복귀 (useFocusEffect)
  → 재조회로 isStudied 최신화
```

---

## 3. 변경된 파일 목록

### 3-1. 신규 생성

#### `store/useSubjectStore.ts`

```typescript
// subjects / concepts 전담 스토어
type SubjectState = {
  subjects: Subject[];
  conceptsMap: Record<number, ConceptStage[]>;
  isLoading: boolean;
  loadSubjects: () => Promise<void>;
  loadAllConcepts: (subjects: Subject[]) => Promise<void>;
  getConceptById: (conceptId: number) => ConceptStage | undefined;
  getSubjectIndexByConceptId: (conceptId: number) => number;
  getSubjectByConceptId: (conceptId: number) => Subject | undefined;
};
```

- persist 없음 — 포커스마다 서버에서 최신 `isStudied` 수신
- `getSubjectIndexByConceptId` → 퀴즈 화면 액센트 색 결정에 사용

---

### 3-2. 수정된 파일

#### `types/quiz.ts`

```typescript
// 추가된 타입
export type Subject = {
  subjectId: number;
  name: string;
  conceptCount: number;
};

export type ConceptStage = {
  conceptId: number;
  parentId: number | null;
  title: string;
  hasChild: boolean;
  isStudied: boolean;
};
```

---

#### `api/quiz.ts`

```typescript
// 추가된 함수
export async function fetchSubjects(): Promise<Subject[]>
export async function fetchConceptsBySubject(subjectId: number): Promise<ConceptStage[]>
```

콘솔 로그 추가 위치:
- `fetchSubjects` → 전체 응답
- `fetchConceptsBySubject` → 개념 수 + 첫 3개 미리보기
- `fetchQuizConceptData` → 전체 응답
- `submitQuizResult` → 전체 응답

---

#### `constants/homeLayout.ts`

```typescript
// 제거: CHAPTER_SECTION_HEIGHTS, CHAPTER_BREAKPOINTS (정적)
// 추가: 동적 계산 함수
export function computeSectionHeight(stageCount: number): number
export function computeBreakpoints(stageCounts: number[]): number[]
```

---

#### `components/home/ChapterSection.tsx`

| 변경 전 | 변경 후 |
|---|---|
| `chapterIdx: number` prop | `name: string` prop |
| `CHAPTER_NAMES[chapterIdx]` | `name` |
| `completedStages.includes(id)` | `studiedConceptIds.has(id) \|\| completedStages.includes(id)` |

`studiedConceptIds: Set<number>` prop 추가 → 서버 `isStudied` + 로컬 애니메이션 상태 모두 반영

---

#### `components/home/StageModal.tsx`

```typescript
// 변경 전
export type SelectedStage = { id: number; color: string };
// STAGE_INFO, CHAPTER_NAMES, CHAPTER_LETTERS 내부 참조

// 변경 후
export type SelectedStage = {
  id: number;
  color: string;
  title: string;      // 외부에서 주입
  chapterName: string; // 외부에서 주입
};
// 내부 STAGE_INFO 참조 완전 제거
```

---

#### `components/home/StickyChapterBar.tsx`

```typescript
// 변경 전: CHAPTER_COLORS, CHAPTER_NAMES 하드코딩 사용
// 변경 후: props로 수신
type Props = {
  currentChapter: number;
  fadeAnim: Animated.Value;
  subjectNames: string[];   // 추가
  colors: string[];          // 추가
};
```

---

#### `app/(tabs)/index.tsx`

주요 변경:

1. `CHAPTER_LETTERS / CHAPTER_STAGES` 제거 → `useSubjectStore`의 `subjects`, `conceptsMap` 사용
2. `useFocusEffect`에서 `loadSubjects()` → `loadAllConcepts()` 순차 호출
3. `chapterBreakpoints`를 `useMemo` + `computeBreakpoints()` 동적 계산
4. `currentStageId`를 `allConcepts.find(!isStudied && !completedStages)` 로 결정
5. `studiedConceptIds` Set을 `conceptsMap`에서 추출해 `ChapterSection`에 전달
6. `onStagePress`에서 `concept.title`, `subject.name`을 `SelectedStage`에 담아 전달

---

#### `app/quiz/[id].tsx`

| 변경 전 | 변경 후 |
|---|---|
| `STAGE_INFO[id].chapter` (헤더) | `getSubjectByConceptId(id)?.name` |
| `STAGE_INFO[id].title` (헤더) | `conceptTitle` state (API 응답 `data.conceptTitle`) |
| `getAccentColor` (STAGE_INFO 기반) | `CHAPTER_COLORS[getSubjectIndexByConceptId(id)]` |
| 로컬 `CHAPTER_COLORS` 상수 | `import { CHAPTER_COLORS } from "@/constants/stageInfo"` |

---

#### `mocks/index.ts`

```typescript
// 추가된 목 엔드포인트
GET  /api/subjects              → CHAPTER_LETTERS 기반 8개 Subject 반환
GET  /api/subjects/{id}/concepts → 해당 챕터의 STAGE_INFO 기반 ConceptStage[] 반환

// 변경된 목 엔드포인트
POST /api/quiz/submit-result    → isCompleted=true 시 studiedConceptIds(인메모리) 갱신
                                   → 이후 concepts 재조회 시 isStudied=true 반환
```

목 데이터 매핑 구조:
- `subjectId 1` → 챕터 A (Java 기초, 15개)
- `subjectId 2` → 챕터 B (객체지향(OOP), 15개)
- `subjectId 3` → 챕터 C (클래스와 키워드, 7개)
- ...
- `subjectId 8` → 챕터 H (직렬화, 5개)

---

#### `components/quiz/MatchingOptions.tsx`

기존 TS 에러 수정:
```typescript
// 변경 전 (color: string | null 타입 불일치)
<Text style={[styles.icon, { color }]}>

// 변경 후
<Text style={[styles.icon, color ? { color } : undefined]}>
```

---

## 4. isStudied 동작 원리

```
서버 isStudied  ─────────────────────────────── 완료 표시 (ChapterSection)
                                                          ↑ OR
로컬 completedStages (useStageStore)  ─ 도비 애니메이션 트리거 + 완료 표시
```

- **서버 기준**: 화면 재진입 시 `fetchConceptsBySubject` 재호출 → `isStudied` 갱신
- **로컬 기준**: 퀴즈 완료 직후 애니메이션 재생 (`triggerEating` → `confirmComplete`)
- 두 값 OR 조합으로 표시하므로 서버 반영 전에도 완료 표시 유지

---

## 5. 디버그 로그 확인 순서

앱 실행 후 Metro 콘솔에서 아래 순서로 확인:

```
[quiz/fetchSubjects] 응답: [{ subjectId, name, conceptCount }, ...]
[useSubjectStore] subjects 로드 완료: 8개 [...]

[quiz/fetchConceptsBySubject] subjectId=1 개념 수: 15
[quiz/fetchConceptsBySubject] subjectId=2 개념 수: 15
...
[useSubjectStore] 전체 concepts 로드 완료: 84개 (8개 subject)

// 스테이지 클릭 후
[quiz/fetchQuizConceptData] 응답: { randomSeed, conceptId, conceptTitle, detailsList, siblings }

// 퀴즈 완료 후
[quiz/submitQuizResult] 응답: { valid, score, dotoriEarned, streak }
```

정상 기준: subjects 8개, 전체 concepts 84개

---

## 6. 남은 작업 (TODO)

- [ ] 실제 백엔드 API 연결 후 `mocks/index.ts` 목 비활성화
- [ ] `conceptsMap` 캐싱 전략 검토 (현재 포커스마다 전체 재조회)
- [ ] `STAGE_INFO` 상수 (`constants/stageInfo.ts`) 최종 삭제 검토 — 현재 `mocks/index.ts`, `CHAPTER_COLORS` 등에서 여전히 참조 중
