# 퀴즈 로직 전체 정리

## 1. 전체 흐름

```
홈 화면 (index.tsx)
  → 스테이지 버튼 탭
  → StageModal (시작 확인)
  → /quiz/[id] 진입
      ├─ fetchQuizConceptData(conceptId)   ← 서버에서 개념 데이터 수신
      ├─ QuizPool 확인 → 문제 선택
      ├─ 5문제 풀기 (객관식 / OX / 단답 / 매칭)
      ├─ 오답 있으면 → Retry
      ├─ submitQuizResult()               ← 서버에 결과 제출
      └─ ResultScreen → StreakScreen → QuestRewardScreen
  → router.back() → 홈 복귀
      └─ refreshConcepts()               ← isStudied 상태만 재갱신
```

---

## 2. 서버 데이터 구조 (QuizConceptData)

```ts
type QuizConceptData = {
  randomSeed: number;       // 서버가 내려주는 시드값 (Java random과 동기화)
  conceptId: number;
  conceptTitle: string;
  parentId: number | null;
  detailsList: ConceptDetail[];   // 현재 개념의 세부 항목 (key/value)
  siblings: SiblingConcept[];     // 같은 부모를 가진 형제 개념들
};

type ConceptDetail = {
  id: number;
  key: string;   // "definition" | "feature" | "comparison" 등
  value: string;
};
```

---

## 3. 문제 생성 (quizGenerator.ts)

### 3-1. JavaRandom — 서버와 시드 동기화

서버(Java)의 `java.util.Random`과 동일한 LCG 알고리즘을 TypeScript로 구현.
시드 기반으로 항상 같은 순서의 문제가 생성됨.

```
seed 초기화: seed = (seed XOR 0x5deece66d) & ((1 << 48) - 1)
next(bits): seed = seed * 0x5deece66d + 0xb  (mod 2^48)
nextInt(n): 표준 Java nextInt와 동일한 rejection sampling
shuffle(): Java Collections.shuffle과 동일한 역방향 Fisher-Yates
```

### 3-2. toRawData — 입력 정규화

`detailsList` + `siblings.detailsList`를 하나의 flat 배열로 변환.

```ts
type RawItem = { concept_id, title, key, value }
```

정렬 기준: `concept_id` → `key` (서버와 동일한 순서 보장)

### 3-3. 문제 타입별 생성 규칙

| 타입 | 생성 규칙 |
|------|-----------|
| **객관식** (MULTIPLE_CASE) | 각 RawItem마다 1문제. 오답 풀에서 중복 제거 후 정렬 → 셔플 → 3개 추출. 정답과 합쳐 4지선다 |
| **OX** | 각 RawItem마다 O문제 1개 + X문제 1개 생성. X문제의 오답은 `rng.nextInt`로 결정론적 선택 |
| **단답형** (SHORT_ANSWER) | 각 RawItem마다 1문제. value를 보여주고 title(개념명)을 맞추는 방식. rng 미사용 |
| **매칭형** (MATCHING) | title이 서로 다른 3개 조합(combo)을 모두 열거 → 100개 초과 시 셔플 후 샘플링. 3:3 매칭 문제 생성 |

---

## 4. 문제 선택 (selectBalancedQuestions)

전체 생성된 문제 중 5개를 타입 균형을 맞춰 선택.

```
1. 문제를 타입별로 분류 (mc / ox / sa / matching)
2. 각 타입에서 rng.shuffle 적용
3. 타입별로 1개씩 먼저 채움 (최대 4개)
4. 남은 자리는 remaining 풀에서 채움
5. 최종 5개를 rng.shuffle로 순서 섞음
6. 나머지는 QuizPool에 저장 (다음 진입 시 재사용)
```

---

## 5. QuizPool — 문제 재사용 (useQuizPoolStore)

같은 스테이지를 반복 플레이할 때 이전과 다른 문제를 출제하기 위한 풀.

- `initPool(conceptId, questions)`: 사용하지 않은 문제들을 저장
- `popFromPool(conceptId, count)`: categoryId 중복 없이 count개 꺼냄
- AsyncStorage에 persist → 앱 재시작 후에도 유지

```
첫 진입: pool 비어있음 → generateQuestions → 5개 선택 → 나머지 pool 저장
재진입:  pool에서 5개 꺼냄 → pool 소진 시 다시 generate
```

---

## 6. 퀴즈 상태 머신 (useQuizStore)

### 정상 플로우

```
setQuestions(5개)
  → currentIndex: 0..4
  → markAnswer(correct) + recordAnswer(questionNumber, quizType, answer)
  → nextQuestion()
  → 마지막 문제 → 오답 없으면 finishQuiz() → isFinished: true
                 → 오답 있으면 enterRetry()
```

### Retry 플로우

```
enterRetry()
  → retryQueue = 오답 문제들 (matching 제외)
  → markRetryAnswer(correct)
  → nextRetryQuestion()
      ├─ 정답: 큐에서 제거
      └─ 오답: 큐 뒤에 다시 추가
  → retryQueue.length === 0 → isFinished: true
```

### 주요 상태

| 상태 | 설명 |
|------|------|
| `questions` | 현재 라운드 5문제 |
| `currentIndex` | 현재 문제 인덱스 |
| `isCorrect[]` | 각 문제 정답 여부 (null=미답) |
| `userAnswers[]` | 서버 제출용 답안 기록 |
| `isRetrying` | 오답 재시도 모드 여부 |
| `retryQueue` | 재시도 대기 중인 문제들 |
| `conceptId` / `randomSeed` | 서버 제출 시 사용 |

---

## 7. 서버 제출 (submitQuizResult)

`isFinished === true` 감지 시 자동 제출.

```ts
POST /api/quiz/submit-result
{
  conceptId: number,
  randomSeed: number,       // 서버가 내려준 값 그대로 반환
  isCompleted: true,
  userAnswers: [
    { questionNumber, quizType, answer }
    // quizType: "MULTIPLE_CASE" | "OX" | "SHORT_ANSWER" | "MATCHING"
    // answer:   number(index) | boolean | string | Record<string,number>
  ]
}
```

응답에서 `dotoriEarned`, `streak` 정보를 받아 `applyQuizReward()`로 로컬 상태 반영.

---

## 8. 결과 화면 순서

```
ResultScreen  → 점수, 도토리 획득량 표시
StreakScreen   → 연속 학습 스트릭 현황
QuestRewardScreen → 퀘스트 보상 확인
router.back() → 홈 복귀
```

---

## 9. 홈 복귀 후 상태 갱신

| 갱신 대상 | 방법 |
|-----------|------|
| 도토리 / 스트릭 | `applyQuizReward()` (즉시, 낙관적 갱신) |
| 스테이지 완료 표시 | `triggerEating()` → 도비 애니메이션 → `confirmComplete()` |
| 서버 isStudied | `refreshConcepts()` (subjects 재요청 없이 concepts만 갱신) |
| 캐시 | `refreshConcepts()` 내부에서 AsyncStorage 업데이트 |
