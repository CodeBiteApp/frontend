# 퀴즈 시스템 로직 정리

## 목차

1. [전체 아키텍처 개요](#1-전체-아키텍처-개요)
2. [데이터 모델 및 DB 스키마](#2-데이터-모델-및-db-스키마)
3. [계층 구조 (Subject → Chapter → Concept)](#3-계층-구조)
4. [API 엔드포인트](#4-api-엔드포인트)
5. [퀴즈 생성 로직](#5-퀴즈-생성-로직)
6. [오답 선지(Distractor) 선택 로직](#6-오답-선지distractor-선택-로직)
7. [답안 검증 및 채점 로직](#7-답안-검증-및-채점-로직)
8. [결과 처리 및 보상 시스템](#8-결과-처리-및-보상-시스템)
9. [시드 데이터 로딩](#9-시드-데이터-로딩)
10. [핵심 설계 원칙](#10-핵심-설계-원칙)

---

## 1. 전체 아키텍처 개요

```
Client
  │
  ├─ GET /api/quiz/concept-data  ──→  QuizDataService
  │     ↳ randomSeed, 개념정보, 형제개념, 글로벌 오답 후보 반환
  │
  ↓ (클라이언트가 seed를 이용해 퀴즈 화면을 구성 후 제출)
  │
  └─ POST /api/quiz/submit-result  ──→  QuizResultService → ValidationService
        ↳ 서버가 동일 seed로 문제를 재생성하여 정답 여부 검증
        ↳ Studied 마킹 + 도토리/스트릭 보상
```

**핵심 설계**: 서버는 퀴즈 상태를 저장하지 않습니다.  
`randomSeed` 하나로 서버와 클라이언트가 **동일한 문제 순서와 선지**를 결정론적으로 재현합니다.

---

## 2. 데이터 모델 및 DB 스키마

### Subject (과목)

| 컬럼 | 타입               | 설명                  |
| ---- | ------------------ | --------------------- |
| id   | Long (PK, AI)      | 과목 ID               |
| name | VARCHAR(50) UNIQUE | 과목명 (e.g., "Java") |

### Concept (개념)

| 컬럼       | 타입                | 설명                                 |
| ---------- | ------------------- | ------------------------------------ |
| id         | Long (PK, AI)       | 개념 ID                              |
| subject_id | Long (FK)           | 소속 과목                            |
| parent_id  | Long (FK, nullable) | 부모 개념 ID (챕터/중간 노드)        |
| title      | VARCHAR(100)        | 개념 이름 (e.g., "public")           |
| has_child  | boolean             | 자식 개념 보유 여부 (리프 노드 판별) |

### ConceptDetail (개념 상세)

| 컬럼       | 타입          | 설명                                                                 |
| ---------- | ------------- | -------------------------------------------------------------------- |
| id         | Long (PK, AI) | 상세 ID                                                              |
| concept_id | Long (FK)     | 소속 개념                                                            |
| key        | VARCHAR(50)   | 속성 유형 (`definition`, `feature`, `specification`, `principle` 등) |
| value      | TEXT          | 실제 설명 내용                                                       |

### Studied (학습 기록)

| 컬럼       | 타입    | 설명           |
| ---------- | ------- | -------------- |
| id         | Long    | 기록 ID        |
| user_id    | Long    | 유저 ID (FK)   |
| concept_id | Long    | 개념 ID (FK)   |
| is_marked  | boolean | 학습 완료 여부 |

> UNIQUE 제약: `(user_id, concept_id)`

---

## 3. 계층 구조

```
Subject (과목)
  └─ Concept (챕터, hasChild=true, parentId=null)
       └─ Concept (리프 개념, hasChild=false, parentId=챕터ID)
            └─ ConceptDetail (definition, feature, ...)
```

**예시**

```
Subject: Java (id=1)
  └─ Chapter: Java 접근 제어자 (id=6, hasChild=true)
       ├─ public   (id=7, hasChild=false, parentId=6)
       ├─ protected (id=8, hasChild=false, parentId=6)
       ├─ default  (id=9, hasChild=false, parentId=6)
       └─ private  (id=10, hasChild=false, parentId=6)
```

- **형제 개념(siblings)**: 같은 `parentId`를 가진 다른 리프 개념들
- 퀴즈는 **리프 개념**(`hasChild=false`)에 대해서만 생성됩니다.

---

## 4. API 엔드포인트

### `GET /api/quiz/concept-data`

퀴즈에 필요한 모든 데이터를 클라이언트에 전달합니다.

**Request**

| 파라미터  | 위치  | 설명    |
| --------- | ----- | ------- |
| conceptId | Query | 개념 ID |

**Response: `QuizConceptDataResponse`**

```json
{
  "randomSeed": 1748514622041,
  "conceptId": 7,
  "conceptTitle": "public",
  "parentId": 6,
  "detailsList": [
    { "key": "definition", "value": "모든 곳에서 접근 가능한 접근 제어자" },
    { "key": "feature", "value": "..." }
  ],
  "siblings": [
    { "conceptId": 8, "title": "protected", "details": [...] },
    { "conceptId": 9, "title": "default",   "details": [...] },
    { "conceptId": 10, "title": "private",  "details": [...] }
  ],
  "globalDistractorCandidatesByKey": {
    "definition": ["...", "...", "..."],
    "feature":    ["...", "..."]
  }
}
```

---

### `POST /api/quiz/submit-result`

클라이언트가 완성한 답안을 제출합니다. 서버는 seed로 문제를 재생성해 검증합니다.

**Request: `QuizResultSubmissionRequest`**

```json
{
  "conceptId": 7,
  "randomSeed": 1748514622041,
  "isCompleted": true,
  "userAnswers": [
    { "type": "MULTIPLE_CASE", "answer": 2 },
    { "type": "OX", "answer": true },
    { "type": "SHORT_ANSWER", "answer": "public" },
    { "type": "MATCHING", "answer": { "0": 1, "1": 0, "2": 2 } }
  ]
}
```

**Response: `QuizSubmitResultResponse`**

```json
{
  "valid": true,
  "score": 75,
  "correctCount": 3,
  "totalCount": 4,
  "dotoriEarned": 5,
  "streak": {
    "alreadyCheckedIn": false,
    "currentStreak": 3,
    "longestStreak": 7,
    "bonusEarned": 10,
    "studyHistory": []
  }
}
```

---

### `GET /api/subjects`

전체 과목 목록과 각 과목의 리프 개념 수를 반환합니다.

**Response**

```json
[
  { "subjectId": 1, "name": "Java", "conceptCount": 42 },
  { "subjectId": 2, "name": "Spring", "conceptCount": 30 }
]
```

---

### `GET /api/subjects/{subjectId}/concepts`

특정 과목의 모든 개념 트리와 학습 여부를 반환합니다.

**Response**

```json
[
  {
    "conceptId": 6,
    "parentId": null,
    "title": "Java 접근 제어자",
    "hasChild": true,
    "isStudied": false
  },
  {
    "conceptId": 7,
    "parentId": 6,
    "title": "public",
    "hasChild": false,
    "isStudied": true
  }
]
```

---

## 5. 퀴즈 생성 로직

### Seeded Random (결정론적 난수)

```
seed = randomSeed (System.currentTimeMillis() 등)
state = seed & 0xffffffff

nextInt(n) {
  state = (1664525 * state + 1013904223) & 0xffffffff
  return abs(state) % n
}
```

LCG(Linear Congruential Generator) 방식으로, **같은 seed → 항상 같은 문제 순서와 선지**.

---

### 문제 유형 및 생성 조건

| 유형            | 조건                            | 정답 기준                                |
| --------------- | ------------------------------- | ---------------------------------------- |
| `MULTIPLE_CASE` | 형제 개념이 3개 이상            | 해당 개념의 `definition` (선택지 인덱스) |
| `OX`            | 형제 개념이 1개 이상            | 참/거짓 (Boolean)                        |
| `SHORT_ANSWER`  | `definition` ConceptDetail 존재 | 개념 `title` 자체 (소문자 비교)          |
| `MATCHING`      | 현재 개념 + 형제 합산 3개 이상  | 개념-정의 매핑 (`Map<Int, Int>`)         |

### MULTIPLE_CASE 생성 흐름

```
1. 현재 개념의 definition 값 = 정답
2. 형제 중 3개 무작위 선택 → 각각의 definition = 오답 선지
3. 정답 포함 4개 선지를 섞어 제시
4. 정답 위치(인덱스 0~3)를 answer로 저장
```

### OX 생성 흐름

```
seed 기반으로 50% 확률 분기:
  - true  (정답=true) : 현재 개념의 feature/definition 문장 제시 → "맞다"
  - false (정답=false): 임의 형제의 definition을 현재 개념 설명으로 위장 → "틀리다"
```

### SHORT_ANSWER 생성 흐름

```
1. 현재 개념의 definition 값을 문제 본문으로 제시
2. 정답 = 개념 title (대소문자 무관, trim 후 비교)
```

### MATCHING 생성 흐름

```
1. 현재 개념 + 형제 2개 선택 (총 3개)
2. 각 개념의 title과 definition을 분리 배열로 섞기
3. 클라이언트가 title-definition 쌍을 연결
4. 정답 = Map<titleIndex, definitionIndex>
```

---

## 6. 오답 선지(Distractor) 선택 로직

### 형제 기반 오답 (Sibling Distractors)

- 같은 `parentId`를 가진 다른 리프 개념들의 definition/feature 값 사용
- `MULTIPLE_CASE`, `OX`, `MATCHING` 생성에 직접 사용

### 글로벌 오답 풀 (Global Distractor Pool)

```
QuizDataService.buildGlobalDistractorCandidatesByKey()

1. key별로 (definition, feature, ...) ALL 개념의 값을 조회
2. 현재 개념의 값 제외 (dedup)
3. 셔플 후 최대 30개(GLOBAL_DISTRACTOR_LIMIT)만 선택
4. Map<String, List<String>> 형태로 클라이언트에 전송
```

> 글로벌 오답 풀은 클라이언트에 사전 전달되어 클라이언트가 유연하게 추가 오답 선지를 구성할 수 있게 합니다.

---

## 7. 답안 검증 및 채점 로직

`ValidationService.verifyAnswersWithSeed()` 흐름:

```
1. seed 유효성 검사 (양수 여부)
2. 답안 구조 검사 (타입, 값 형식)
3. 개념 및 ConceptDetail 존재 확인
4. 형제 개념 로드
5. 동일 seed로 문제 재생성 → 서버 측 정답 목록 도출
6. 제출된 답안 수 = 생성된 문제 수 확인
7. 타입별 비교:
   - SHORT_ANSWER : trim().toLowerCase() 비교
   - MULTIPLE_CASE: Integer 인덱스 비교
   - OX           : Boolean 비교
   - MATCHING     : Map<Integer, Integer> 비교
8. correctCount / totalCount 계산
9. score = correctCount * 100 / totalCount (정수 %)
```

---

## 8. 결과 처리 및 보상 시스템

`QuizResultService.submitResult()` 흐름:

```
1. ValidationService로 검증
2. isCompleted=true AND 정답인 경우에만:
   - Studied 레코드 생성 or 업데이트 (isMarked=true)
3. StreakRewardService 호출:
   - 오늘 이미 체크인했는지 확인 (alreadyCheckedIn)
   - 연속 학습일(currentStreak), 최장 연속(longestStreak) 계산
   - 도토리(Dotori) 기본 지급
   - 스트릭 보너스(bonusEarned) 추가 지급
4. QuizSubmitResultResponse 반환
```

**보상 지급 조건 요약**

| 조건                              | 결과                  |
| --------------------------------- | --------------------- |
| isCompleted=false                 | Studied 마킹 없음     |
| isCompleted=true, 오답            | Studied 마킹 없음     |
| isCompleted=true, 정답            | Studied 마킹 + 도토리 |
| 오늘 첫 제출                      | 스트릭 증가 + 보너스  |
| 오늘 이미 제출 (alreadyCheckedIn) | 스트릭 변동 없음      |

---

## 9. 시드 데이터 로딩

`QuizSeedInitializer` — 앱 시작 시 `CommandLineRunner`로 실행됩니다.

### 로딩 우선순위

```
1. 환경변수 QUIZ_SEED_FILE_PATH에 지정된 파일 (외부 파일)
2. classpath:data/chapter*.txt (내장 리소스 파일)
```

### 데이터 파일 목록

| 파일명                 | 내용               |
| ---------------------- | ------------------ |
| `chapter1_java.txt`    | Java 관련 개념     |
| `chapter2_spring.txt`  | Spring 관련 개념   |
| `chapter3_network.txt` | 네트워크 관련 개념 |
| `chapter4_DB.txt`      | DB 관련 개념       |

### 파일 형식 (SQL INSERT)

```sql
-- SUBJECT
INSERT INTO Subject (id, name) VALUES
(1, 'java');

-- CONCEPT
INSERT INTO Concept (id, subject_id, parent_id, title, has_child) VALUES
(6, 1, NULL, 'Java 접근 제어자', 1),
(7, 1, 6, 'public', 0);

-- CONCEPT_DETAIL
INSERT INTO Concept_detail (id, concept_id, `key`, value) VALUES
(1, 7, 'definition', '모든 곳에서 접근 가능한 접근 제어자'),
(2, 7, 'feature',    '상속, 패키지, 외부 클래스 모두 접근 허용');
```

### 로딩 처리 흐름

```
1. 섹션별 파싱 (Subject / Concept / Concept_detail 블록 분리)
2. Regex로 각 행(row) 파싱
3. Subject: 이름 기준으로 upsert (중복 방지)
4. Concept: parent 관계 재귀 해석 후 저장
5. ConceptDetail: 중복 무시, 없으면 신규 저장
```

---

## 10. 핵심 설계 원칙

### 결정론적 퀴즈 (Stateless Server)

서버는 퀴즈 세션 상태를 DB에 저장하지 않습니다.  
`randomSeed`를 공유함으로써 클라이언트와 서버가 독립적으로 같은 문제를 재현합니다.  
→ 서버 메모리/DB 부하 최소화, 클라이언트 캐싱 가능

### 유연한 Key-Value ConceptDetail

단일 `Concept`에 `definition`, `feature`, `principle`, `specification` 등 다양한 속성을 붙일 수 있어 퀴즈 유형 확장이 용이합니다.

### 글로벌 오답 풀 사전 전달

서버가 오답 후보를 미리 계산하여 클라이언트에 전송함으로써, 클라이언트가 다양한 방식으로 선지를 구성할 수 있습니다.

### 학습 완료 조건 이중 검증

`isCompleted=true` (사용자 의도) AND 정답 검증 통과 — 두 조건 모두 충족해야 `Studied` 마킹이 됩니다.

---

## 관련 파일 위치

```
src/main/java/com/jajup/codeBite/quiz/
├── controller/
│   ├── QuizController.java       # 퀴즈 데이터 조회 / 결과 제출 API
│   └── SubjectController.java    # 과목 목록 / 개념 트리 API
├── service/
│   ├── QuizDataService.java      # 퀴즈 데이터 조립 (seed 생성, 글로벌 오답 풀)
│   ├── ValidationService.java    # 퀴즈 생성 재현 및 답안 검증
│   ├── QuizResultService.java    # 결과 처리 및 보상 지급
│   ├── SubjectQueryService.java  # 과목/개념 조회
│   └── QuizSeedInitializer.java  # 시드 데이터 초기화
├── entity/
│   ├── Subject.java
│   ├── Concept.java
│   └── ConceptDetail.java
├── repository/
│   ├── SubjectRepository.java
│   ├── ConceptRepository.java
│   └── ConceptDetailRepository.java
└── dto/
    ├── QuizConceptDataResponse.java
    ├── QuizResultSubmissionRequest.java
    ├── QuizSubmitResultResponse.java
    ├── SiblingConceptDto.java
    ├── ConceptDetailDto.java
    ├── SubjectSummaryResponse.java
    └── SubjectConceptResponse.java

src/main/java/com/jajup/codeBite/bookmark/
└── entity/Studied.java           # 사용자 학습 완료 기록

src/main/resources/data/
├── chapter1_java.txt
├── chapter2_spring.txt
├── chapter3_network.txt
└── chapter4_DB.txt
```
