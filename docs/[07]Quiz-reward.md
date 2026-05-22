### **백엔드 상태**

- `GET /api/quiz/concept-data` — **사용 중 (변경 없음)**
- `POST /api/quiz/submit-result` — **구현 완료, 프론트 연동만 필요**

---

### **프론트에서 할 일 (1개)**

퀴즈 세션 **완전 종료 후** `submit-result` 호출 → 응답으로 결과·보상 UI 반영

`concept-data` 받을 때 **`conceptId`, `randomSeed` 저장**해 두기.

---

### **API**

**`POST /api/quiz/submit-result`**

- Header: `Authorization: Bearer {accessToken}`
- Body:

{

"conceptId": 10,

"randomSeed": 4815162342,

"isCompleted": true,

"userAnswers": [

{ "questionNumber": 1, "quizType": "MULTIPLE_CASE", "answer": 0 },

{ "questionNumber": 2, "quizType": "OX", "answer": true },

{ "questionNumber": 3, "quizType": "SHORT_ANSWER", "answer": "public" }

]

}

| **필드** | **설명** |
| --- | --- |
| `conceptId`, `randomSeed` | `concept-data` 응답 그대로 |
| `isCompleted` | 재풀이까지 끝났을 때만 `true` (보상 조건) |
| `userAnswers` | 실제 출제된 문제만, `questions` 순서대로 `questionNumber` 1부터 |

**`userAnswers` 매핑**

| **UI** | **`quizType`** | **`answer`** |
| --- | --- | --- |
| 객관식 | `MULTIPLE_CASE` | 선택 인덱스 (number) |
| OX | `OX` | `true` / `false` |
| 단답 | `SHORT_ANSWER` | 문자열 |
| 매칭 | `MATCHING` | `{ "0": 1, "1": 0, "2": 2 }` 등 객체 |

---

### **응답 (UI에 쓸 필드)**

{

"valid": true,

"score": 75,

"correctCount": 3,

"totalCount": 4,

"dotoriEarned": 15,

"streak": {

"alreadyCheckedIn": false,

"currentStreak": 8,

"longestStreak": 30,

"bonusEarned": 5,

"studyHistory": []

}

}

- 보상 필드명: **`dotoriEarned`** (`cookieEarned` 아님)
- `dotoriEarned`: 오늘 첫 완료 **15** (10+5), 같은 날 재호출 **0** + `alreadyCheckedIn: true`
- `studyHistory`: **항상 `[]`** (당분간 무시)

---

### **호출 타이밍**

- `finishQuiz` / 결과 화면 **직전 또는 진입 시** 1회
- `isCompleted: false` → 보상 없음

---

### **로컬 테스트 전제**

- 백엔드 기동 + `chapter1_java` 시드 적재
- 로그인 후 JWT 붙는 상태
- `EXPO_PUBLIC_API_URL` 백엔드 주소 맞추기

---

### **이번 범위 밖 (프론트 작업 불필요)**

- `Studied` / 스테이지 `isStudied`
- `studyHistory` / `GET /api/streak`
- 서버 채점 로직 (백엔드 처리 완료)

---

### **한 줄**

> **`*concept-data`는 그대로 두고, 세션 끝에 `submit-result`만 붙이면 서버가 채점·보상(`dotoriEarned`, `streak`)을 돌려줍니다.***
>