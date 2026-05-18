# 퀴즈 앱 설계 문서

---

## 1. 데이터 설계

### 1-1. 엔티티 구조

```
Subject
└── Concept (parent_id 자기참조 트리)
    └── Concept_detail (key / value)
```

---

### 1-2. Concept — 트리 구조

| 컬럼       | 타입           | 설명                   |
| ---------- | -------------- | ---------------------- |
| id         | number         | PK                     |
| subject_id | number         | FK → Subject           |
| parent_id  | number \| NULL | 자기참조 (루트면 NULL) |
| title      | string         | 개념 이름              |
| has_child  | boolean        | 자식 노드 존재 여부    |

**트리 예시**

```
자바의 기초 (id=1)
├── Java 프로그래밍이란 (id=2)
├── Java SE와 Java EE 차이 (id=3)
│   ├── Java SE (id=8)
│   └── Java EE (id=9)
├── 접근 제어자 (id=6)
│   ├── public (id=10)
│   ├── protected (id=11)
│   ├── default (id=12)
│   └── private (id=13)
└── Java 데이터 타입 (id=7)
    ├── 기본형 (id=14)
    └── 참조형 (id=15)
```

---

### 1-3. Concept_detail — key / value 구조

| 컬럼       | 타입   | 설명         |
| ---------- | ------ | ------------ |
| id         | number | PK           |
| concept_id | number | FK → Concept |
| key        | string | 데이터 유형  |
| value      | string | 내용         |

**key 종류**

| key             | 용도                                |
| --------------- | ----------------------------------- |
| `definition`    | 개념의 근본적인 정의 ("A란 ~이다")  |
| `feature`       | 성질, 장점, 한계점 등 부가 특징     |
| `comparison`    | 유사/상반된 개념 간 차이점          |
| `specification` | 기술 규격, 표준 시그니처, 종류 목록 |
| `principle`     | 내부 동작 메커니즘, 설계 원칙       |
| `best_practice` | 실무 권장 방식, 주의 사항           |

**조회 예시 (JOIN 필수)**

```sql
SELECT
    cd.id,
    cd.key,
    cd.value,
    c.title
FROM Concept_detail cd
JOIN Concept c ON c.id = cd.concept_id;
```

> ⚠️ concept title은 Concept_detail에 직접 저장하지 않는다. 반드시 JOIN으로 조회한다.

---

### 1-4. 문제 유형

#### 유형 1) 객관식 (Multiple Choice)

- 같은 `parent_id`의 형제 concept 활용
- 동일 `key` 기준으로 오답 구성 (정답 1개 + 오답 N개)
- **옳은 것 찾기** / **옳지 않은 것 찾기** 두 가지 변형

#### 유형 2) OX

- 현재 concept의 value 그대로 사용 → **O**
- 형제 concept의 value를 섞어서 사용 → **X**

#### 유형 3) 단답형 (Short Answer)

- `key = definition` 데이터만 출제 대상
- `definition value`를 문제로, `concept.title`을 정답으로 사용
- 채점: 공백 제거 + 대소문자 무시 비교

#### 유형 4) 매칭형 (Matching)

- 같은 `parent_id`의 형제 concept 여러 개 선택
- `concept.title` (왼쪽) ↔ `value` (오른쪽) 분리 후 셔플

---

### 1-5. 금지 사항

- `concept_title` 중복 저장 금지
- `rank` 컬럼 사용 금지
- `has_child`에 숫자 저장 금지 (boolean만 허용)

---

---

## 2. API 명세서

### 공통 규칙

- 모든 API는 `accessToken` 필수 (Bearer JWT)
- `userId`는 request body에 포함하지 않음 — 서버가 JWT에서 추출
- 모든 API 구현 상태: **미구현 (MVP)**

---

### 2-1. 퀴즈 데이터 조회

```
GET /api/quiz/concept-data?conceptId={id}
```

**설명** : 학습 세션 시작 시 호출. 시드 + 개념 상세 데이터 반환.

**Query Parameter**

| 파라미터  | 타입   | 필수 | 설명           |
| --------- | ------ | ---- | -------------- |
| conceptId | number | ✅   | 조회할 개념 ID |

**서버 처리 흐름**

1. JWT에서 userId 추출
2. `conceptId`로 Concept + Concept_detail 목록 조회
3. `SecureRandom`으로 `randomSeed` 생성
4. `QuizResponseDTO` 조립 후 반환

**Response 200 OK**

```json
{
  "randomSeed": 4815162342,
  "conceptId": 2,
  "conceptTitle": "binary_search",
  "detailsList": [
    {
      "id": 10,
      "conceptId": 2,
      "key": "definition",
      "value": "정렬된 배열에서 탐색 범위를 반으로 줄여가며 찾는 알고리즘"
    },
    { "id": 11, "conceptId": 2, "key": "complexity", "value": "O(log n)" }
  ]
}
```

**에러**

| 상태 코드 | 에러 코드            | 설명                    |
| --------- | -------------------- | ----------------------- |
| 404       | `CONCEPT_NOT_FOUND`  | 존재하지 않는 conceptId |
| 401       | `AUTH_INVALID_TOKEN` | 인증 실패               |

---

### 2-2. 결과 제출

```
POST /api/quiz/submit-result
```

**설명** : 세션 종료(오답 재풀이 포함) 시 결과 제출. 조건 충족 시 학습 완료 처리 + 체크인.

**Request Body**

```json
{
  "conceptId": 2,
  "randomSeed": 4815162342,
  "isCompleted": true,
  "userAnswers": [
    { "questionNumber": 1, "quizType": "SHORT_ANSWER", "answer": "O(log n)" },
    { "questionNumber": 2, "quizType": "MULTIPLE_CASE", "answer": "2" },
    {
      "questionNumber": 3,
      "quizType": "MATCHING",
      "answer": { "left1": "right2", "left2": "right1" }
    }
  ]
}
```

| 필드        | 타입    | 설명                                       |
| ----------- | ------- | ------------------------------------------ |
| conceptId   | number  | 학습한 개념 ID                             |
| randomSeed  | number  | 세션 시작 시 서버에서 받은 시드            |
| isCompleted | boolean | 오답 재풀이까지 포함한 세션 완전 종료 여부 |
| userAnswers | array   | 세션 전체 답안 (재풀이 포함)               |

**서버 처리 흐름**

1. JWT에서 userId 추출
2. `ValidationService` — 동일 시드로 문항 재생성 후 채점
3. `valid=true && isCompleted=true` → `Studied` UPSERT (`is_marked` 기존값 유지, 신규면 `false`)
4. 오늘 첫 완료 여부 확인 (`UserData.lastStudy` 기준)
5. 첫 완료 → 체크인 처리, `currentStreak / longestStreak / cookie` 갱신
6. 이미 오늘 체크인 완료 → `alreadyCheckedIn: true` 멱등 응답
7. `valid=false` → 학습 완료 미인정, 체크인 미처리

**Response 200 OK**

```json
{
  "valid": true,
  "score": 100,
  "correctCount": 4,
  "totalCount": 4,
  "cookieEarned": 10,
  "streak": {
    "alreadyCheckedIn": false,
    "currentStreak": 8,
    "longestStreak": 30,
    "bonusEarned": 5,
    "studyHistory": ["2026-04-07", "2026-04-08", "2026-04-09"]
  }
}
```

**에러**

| 상태 코드 | 에러 코드                 | 설명                      |
| --------- | ------------------------- | ------------------------- |
| 400       | `QUIZ_INVALID_SUBMISSION` | 답안 형식 오류            |
| 404       | `CONCEPT_NOT_FOUND`       | 존재하지 않는 conceptId   |
| 422       | `QUIZ_SEED_MISMATCH`      | 시드와 개념 데이터 불일치 |

---

### 2-3. 전체 과목 목록

```
GET /api/subjects
```

**설명** : 전체 Subject 목록 조회.

**Response 200 OK**

```json
[
  { "id": 1, "name": "algorithm" },
  { "id": 2, "name": "network" },
  { "id": 3, "name": "os" },
  { "id": 4, "name": "database" }
]
```

**에러**

| 상태 코드 | 에러 코드            | 설명      |
| --------- | -------------------- | --------- |
| 401       | `AUTH_INVALID_TOKEN` | 인증 실패 |

---

### 2-4. 과목별 개념 목록

```
GET /api/subjects/{subjectId}/concepts
```

**설명** : 과목에 속한 Concept 목록 조회. 인증 사용자 기준 학습 완료 여부 포함.

**Path Parameter**

| 파라미터  | 타입   | 필수 | 설명    |
| --------- | ------ | ---- | ------- |
| subjectId | number | ✅   | 과목 ID |

**Response 200 OK**

```json
[
  { "id": 1, "title": "linear_search", "rank": 1, "isStudied": true },
  { "id": 2, "title": "binary_search", "rank": 2, "isStudied": false },
  { "id": 3, "title": "dfs", "rank": 3, "isStudied": false }
]
```

> `isStudied` : 인증 사용자 기준 `Studied` 레코드 존재 여부. 스테이지 맵 완료 표시에 사용.

**에러**

| 상태 코드 | 에러 코드            | 설명                    |
| --------- | -------------------- | ----------------------- |
| 404       | `SUBJECT_NOT_FOUND`  | 존재하지 않는 subjectId |
| 401       | `AUTH_INVALID_TOKEN` | 인증 실패               |

---

### 2-5. 개념 상세 조회

```
GET /api/concepts/{conceptId}/detail
```

**설명** : 개념의 key-value 상세 데이터 조회. 북마크 상세 보기 등에 사용.

**Path Parameter**

| 파라미터  | 타입   | 필수 | 설명    |
| --------- | ------ | ---- | ------- |
| conceptId | number | ✅   | 개념 ID |

**Response 200 OK**

```json
{
  "id": 2,
  "title": "binary_search",
  "subjectName": "algorithm",
  "rank": 2,
  "details": [
    {
      "key": "definition",
      "value": "정렬된 배열에서 탐색 범위를 반으로 줄여가며 찾는 알고리즘"
    },
    { "key": "complexity", "value": "O(log n)" },
    { "key": "precondition", "value": "배열이 정렬되어 있어야 한다" }
  ]
}
```

**에러**

| 상태 코드 | 에러 코드            | 설명                    |
| --------- | -------------------- | ----------------------- |
| 404       | `CONCEPT_NOT_FOUND`  | 존재하지 않는 conceptId |
| 401       | `AUTH_INVALID_TOKEN` | 인증 실패               |

---

### 2-6. API 목록 요약

| 메서드 | 경로                                    | 설명                                |
| ------ | --------------------------------------- | ----------------------------------- |
| GET    | `/api/quiz/concept-data?conceptId={id}` | 퀴즈 세션 시작 — 시드 + 개념 데이터 |
| POST   | `/api/quiz/submit-result`               | 세션 결과 제출 + 체크인             |
| GET    | `/api/subjects`                         | 전체 과목 목록                      |
| GET    | `/api/subjects/{subjectId}/concepts`    | 과목별 개념 목록 + 학습 여부        |
| GET    | `/api/concepts/{conceptId}/detail`      | 개념 상세 key-value 조회            |
