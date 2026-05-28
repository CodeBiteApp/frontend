# [13] 퀴즈 풀 관리 + Subject 페이지네이션

> 작업일: 2026-05-28
> 브랜치: `feature/quiz-fix`
> 목적: 스테이지당 과다 문제 수 해결 (최대 ~280문제 → 5문제/세션) + Subject 목록 페이지네이션

---

## 1. 배경

### 문제 1 — 퀴즈 문제 과다

`quizGenerator.ts`가 API로 받은 모든 detail 항목에 대해 4가지 문제 유형(MC, OX×2, SA, Matching)을 전부 생성하는 구조였음.

| 구조 | 문제 수 |
|---|---|
| 주 개념 1개 + siblings 수십 개 × detail 3~4개 = ~45 RawItem | |
| MC × 45 + OX × 90 + SA × 45 + Matching ≤ 100 | **최대 ~280문제** |

→ 세션당 5문제만 노출하되, 나머지는 다음 방문 시 이어서 출제하는 **문제 풀(Pool)** 구조로 전환.

### 문제 2 — Subject 전체 로드

`GET /api/subjects`가 전체 목록을 한 번에 반환 → 20개씩 페이지네이션으로 전환.

---

## 2. Part A: 퀴즈 문제 풀 (Pool) 구조

### 2-1. 설계 원칙

**데이터 손실 없음:** 전체 문제를 생성한 뒤 AsyncStorage에 보관하고, 세션마다 5개씩 꺼냄. 풀이 소진되면 새 seed로 재생성.

**개념 중복 없음:** `popFromPool` 시 `categoryId`(= concept_id) 기준으로 같은 세션 내 중복 개념을 걸러냄. 같은 개념의 다른 유형 문제(MC 봤으면 OX, SA 등)는 풀 앞에 남아 다음 세션에서 출제됨 → **세션마다 다른 유형 자동 순환**.

**세션간 순환 커버리지:**
```
1회 세션: 개념1-MC, 개념3-OX, 개념5-SA ...  (5문제)
2회 세션: 개념1-OX, 개념2-MC, 개념4-SA ...  (5문제)
...
풀 소진 후: 새 seed로 재생성
```

### 2-2. 흐름

```
첫 방문 (pool 없음)
  ↓
fetchQuizConceptData()
  → generateQuestionsFromConceptData()  ← 기존 전체 생성 유지
  → shuffleWithSeed(all, randomSeed)    ← seed 기반 결정론적 셔플
  → initPool(conceptId, shuffled[5:])   ← 나머지 AsyncStorage 저장
  → setQuestions(shuffled[0:5])         ← 5문제 표시

재방문 (pool 있음)
  ↓
fetchQuizConceptData()  (conceptTitle / randomSeed 수신용)
  → popFromPool(conceptId, 5)           ← 개념 중복 제거하며 5개 추출
  → setQuestions(pooled)

pool 소진 (popFromPool 반환 < 5)
  → 첫 방문과 동일하게 재생성
```

### 2-3. 변경된 파일

#### `utils/quizGenerator.ts`

기존 전체 생성 로직 **변경 없음**. `shuffleWithSeed` 유틸만 추가 export:

```typescript
export function shuffleWithSeed<T>(array: T[], seed: number): T[] {
  const rng = new JavaRandom(seed);
  return rng.shuffle([...array]);
}
```

#### `store/useQuizPoolStore.ts` (신규)

AsyncStorage에 영속화되는 문제 풀 전담 스토어.

```typescript
type QuizPoolState = {
  questionPools: Record<number, AnyQuizQuestion[]>; // conceptId → 남은 문제 배열
  initPool: (conceptId: number, questions: AnyQuizQuestion[]) => void;
  popFromPool: (conceptId: number, count: number) => AnyQuizQuestion[];
  clearPool: (conceptId: number) => void;
};
```

`popFromPool` 핵심 로직 — 개념 중복 없이 `count`개 추출:

```typescript
for (const q of pool) {
  if (taken.length < count && !usedCategories.has(q.categoryId)) {
    usedCategories.add(q.categoryId);
    taken.push(q);
  } else {
    remaining.push(q);  // 나머지는 풀에 보존
  }
}
```

persist 설정: `name: "quiz-pool-storage"`, `partialize: (s) => ({ questionPools: s.questionPools })`

#### `app/quiz/[id].tsx`

`QUIZ_COUNT = 5` 상수 추가. `useEffect` 교체:

```typescript
fetchQuizConceptData(conceptIdNum).then((data) => {
  setConceptMeta(data.conceptId, data.randomSeed);
  setConceptTitle(data.conceptTitle);

  const pooled = popFromPool(conceptIdNum, QUIZ_COUNT);
  if (pooled.length >= QUIZ_COUNT) {
    setQuestions(pooled);
  } else {
    // pool 소진 or 첫 방문
    const all = shuffleWithSeed(generateQuestionsFromConceptData(data), data.randomSeed);
    initPool(conceptIdNum, all.slice(QUIZ_COUNT));
    setQuestions(all.slice(0, QUIZ_COUNT));
  }
});
```

---

## 3. Part B: Subject 페이지네이션

### 3-1. API 스펙

```
GET /api/subjects?page=0&size=20

Response:
{
  content: Subject[];
  hasNext: boolean;
  totalCount?: number;
}
```

### 3-2. 변경된 파일

#### `types/quiz.ts`

```typescript
export type SubjectPage = {
  content: Subject[];
  hasNext: boolean;
  totalCount?: number;
};
```

#### `api/quiz.ts`

```typescript
// 변경 전
fetchSubjects(): Promise<Subject[]>

// 변경 후
fetchSubjects(page = 0, size = 20): Promise<SubjectPage>
// Axios params: { page, size }
```

#### `store/useSubjectStore.ts`

추가 state:

| 필드 | 타입 | 설명 |
|---|---|---|
| `subjectPage` | `number` | 다음에 fetch할 페이지 번호 |
| `hasMoreSubjects` | `boolean` | 추가 로드 가능 여부 |

추가/변경 함수:

| 함수 | 설명 |
|---|---|
| `loadSubjects(reset = true)` | reset=true이면 기존 목록 초기화 후 page 0부터 로드. 내부에서 `loadConceptsForSubjects` 자동 호출 |
| `loadMoreSubjects()` | `hasMoreSubjects && !isLoading`일 때 다음 page append + concepts 추가 로드 |
| `loadConceptsForSubjects(subjects)` | 특정 subject 배열의 concepts만 fetch해서 `conceptsMap`에 merge (구 `loadAllConcepts`) |

#### `app/(tabs)/index.tsx`

`useFocusEffect`:
```typescript
// 변경 전
loadSubjects().then(() => { loadAllConcepts(latest); });

// 변경 후
loadSubjects(true);  // 내부에서 concepts 자동 로드
```

스크롤 하단 감지 → 추가 페이지 로드:
```typescript
const isNearBottom = y + layoutMeasurement.height >= contentSize.height - 200;
if (isNearBottom && hasMoreSubjects && !isLoading) {
  loadMoreSubjects();
}
```

ScrollView 하단에 추가 로딩 인디케이터 렌더 (`isLoading && subjects.length > 0`일 때).

---

## 4. 파일 변경 요약

| 파일 | 변경 유형 |
|---|---|
| `utils/quizGenerator.ts` | `shuffleWithSeed` export 추가 |
| `types/quiz.ts` | `SubjectPage` 타입 추가 |
| `api/quiz.ts` | `fetchSubjects` 시그니처 변경 (pagination params) |
| `store/useQuizPoolStore.ts` | **신규** — 문제 풀 전담 persist 스토어 |
| `store/useSubjectStore.ts` | 페이지네이션 state/함수 추가, `loadConceptsForSubjects` 리팩토링 |
| `app/quiz/[id].tsx` | 풀 로직 적용 (`popFromPool` / `initPool`) |
| `app/(tabs)/index.tsx` | `loadSubjects(true)` 단일 호출, 스크롤 하단 추가 로드 |

---

## 5. 남은 작업 (TODO)

- [ ] 실제 백엔드 `/api/subjects?page=&size=` 파라미터 지원 확인
- [ ] `questionPools` 스토리지 용량 모니터링 (스테이지 수 × ~115문제)
- [ ] 풀 소진 후 재생성 시 이미 본 문제 제외 여부 정책 결정
- [ ] `clearPool(conceptId)` 호출 시점 정책 결정 (예: 스테이지 초기화 버튼)
