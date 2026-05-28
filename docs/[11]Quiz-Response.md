## **1) 챕터 목록 조회**

### **`GET /api/subjects`**

- 용도: 홈에서 챕터 카드(예: Java, Spring, Network...) 렌더
- 인증: 현재 보안 설정상 인증 토큰 포함 권장
- 응답:

```json
[
  {
    "subjectId": 1,
    "name": "Java",
    "conceptCount": 84
  },
  {
    "subjectId": 2,
    "name": "Spring",
    "conceptCount": 42
  }
]
```

- 필드 의미
  - `subjectId`: 챕터 ID
  - `name`: 챕터명
  - `conceptCount`: 해당 챕터에서 실제 퀴즈 가능한 스테이지 수(leaf concept 기준)

---

## **2) 챕터별 스테이지 목록 조회**

### **`GET /api/subjects/{subjectId}/concepts`**

- 용도: 챕터 클릭 후 스테이지 리스트 렌더
- 인증: 필요 (`isStudied` 계산에 사용자 정보 사용)
- 응답:

```json
[
  {
    "conceptId": 10,
    "parentId": 6,
    "title": "public",
    "hasChild": false,
    "isStudied": true
  },
  {
    "conceptId": 11,
    "parentId": 6,
    "title": "protected",
    "hasChild": false,
    "isStudied": false
  }
]
```

- 필드 의미
  - `conceptId`: 스테이지 ID (퀴즈 진입 키)
  - `parentId`: 개념 트리 상 부모 ID
  - `title`: 스테이지 제목
  - `hasChild`: 하위 노드 여부
  - `isStudied`: 해당 유저 학습 완료 여부

---

## **3) 스테이지 퀴즈 데이터 조회 (기존 유지)**

### **`GET /api/quiz/concept-data?conceptId={id}`**

- 용도: 스테이지 진입 후 문제 생성용 원천 데이터 받기
- 응답 핵심:

```json
{
  "randomSeed": 123456789,
  "conceptId": 10,
  "conceptTitle": "public",
  "parentId": 6,
  "detailsList": [
    {
      "id": 1,
      "conceptId": 10,
      "key": "definition",
      "value": "..."
    }
  ],
  "siblings": [
    {
      "conceptId": 11,
      "conceptTitle": "protected",
      "detailsList": [
        {
          "id": 2,
          "conceptId": 11,
          "key": "definition",
          "value": "..."
        }
      ]
    }
  ]
}
```

---

## **4) 퀴즈 결과 제출 (기존 유지)**

### **`POST /api/quiz/submit-result`**

- 용도: 채점/보상/streak 반영
- 응답 핵심:

```json
{
  "valid": true,
  "score": 80,
  "correctCount": 8,
  "totalCount": 10,
  "dotoriEarned": 12,
  "streak": {
    "alreadyCheckedIn": false,
    "currentStreak": 3,
    "longestStreak": 7,
    "bonusEarned": 5,
    "studyHistory": ["2026-05-25", "2026-05-26", "2026-05-27"]
  }
}
```

---

## **프론트 연동 흐름(권장)**

1. 홈 진입 → `GET /api/subjects`
2. 챕터 클릭 → `GET /api/subjects/{subjectId}/concepts`
3. 스테이지 클릭 → `GET /api/quiz/concept-data?conceptId=...`
4. 풀이 완료 → `POST /api/quiz/submit-result`

즉, `stageInfo.ts` 하드코딩 대신 위 1~2번 API로 화면 구성하면 완전 동적화됩니다.
