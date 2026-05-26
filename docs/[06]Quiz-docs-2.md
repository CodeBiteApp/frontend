이거는 **프론트 mock 제거 + 실제 API 전환 PR 가이드야**

혹시 몰라서 올려둔거라 안봐도돼

## **Summary**

퀴즈 진입 시 `MOCK_CONCEPT_DATA` 대신 백엔드 `GET /api/quiz/concept-data`를 호출하도록 전환한다.

문제 생성 로직(`quizGenerator`)은 변경하지 않는다.

## **Prerequisites (머지 전 확인)**

| **항목**      | **내용**                                                                              |
| ------------- | ------------------------------------------------------------------------------------- |
| 백엔드 브랜치 | `qa` (또는 quiz API 포함 브랜치)                                                      |
| 백엔드 API    | `GET /api/quiz/concept-data?conceptId={id}` 동작                                      |
| 시드 데이터   | 앱 기동시 `backend/src/main/resources/data/chapter1_java.txt` → DB 적재 (백엔드 내부) |
| 프론트 env    | `EXPO_PUBLIC_API_URL=http://localhost:8080` (또는 실제 서버 URL)                      |
| 인증          | 로그인 후 Access Token이 axios 인터셉터에 붙는 상태                                   |

---

## **변경 범위**

### **1) `frontend/api/quiz.ts` (필수)**

**Before (mock)**

import { MOCK_CONCEPT_DATA } from "@/mocks/quizConceptData";

export async function fetchQuizConceptData(conceptId: number) {

await new Promise((resolve) => setTimeout(resolve, 800));

const data = MOCK_CONCEPT_DATA[conceptId];

if (!data) throw new Error(`CONCEPT_NOT_FOUND: ${conceptId}`);

return data;

}

**After (실제 API)**

import api from "@/api/axios";

import { QuizConceptData } from "@/types/quiz";

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {

const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {

params: { conceptId },

});

return res.data;

}

- `MOCK_CONCEPT_DATA` import 제거
- 인위적 `setTimeout(800)` 제거

---

### **2) `frontend/types/quiz.ts` (권장)**

백엔드 `key`는 `definition`, `feature`, `comparison`, `specification` 등 **문자열 자유**라서, 타입을 너무 좁히면 런타임은 되는데 타입이 깨질 수 있다.

**권장**

export type ConceptDetail = {

id: number;

key: string; _// ConceptDetailKey 유니온 대신 string_

value: string;

};

- `ConceptDetailKey` 유니온은 삭제하거나 내부용으로만 유지

---

### **3) `frontend/mocks/quizConceptData.ts` (선택)**

| **옵션** | **설명**                                                                                     |
| -------- | -------------------------------------------------------------------------------------------- |
| A (권장) | `MOCK_CONCEPT_DATA`만 삭제, `STAGE_CONCEPT_MAP`은 **유지** (`app/quiz/[id].tsx`가 import 중) |
| B        | `STAGE_CONCEPT_MAP`을 `constants/stageConceptMap.ts`로 옮기고 mock 파일 삭제                 |

**주의:** `STAGE_CONCEPT_MAP`은 아직 2개만 등록됨.

_// mocks/quizConceptData.ts_

export const STAGE_CONCEPT_MAP: Record<string, number> = {

"1": 10, _// public_

"2": 2, _// Java 프로그래밍_

};

- `STAGE_CONCEPT_MAP`에 없는 스테이지는 기존처럼 `MOCK_QUESTIONS` fallback (`app/quiz/[id].tsx` 96~97줄)

---

### **4) `frontend/app/quiz/[id].tsx` (권장, 에러 처리)**

현재 API 실패 시 조용히 mock으로 떨어짐:

.catch(() => {

setQuestions(MOCK_QUESTIONS[stageId] ?? []);

})

**PR에서 같이 손보면 좋은 것**

- 404 `CONCEPT_NOT_FOUND` → “해당 스테이지 데이터가 없습니다”
- 401 → 로그인 화면 이동 (기존 `authInterceptor`와 맞추기)
- 개발 중에만 mock fallback 유지할지 팀에서 결정

---

## **API 계약 (프론트가 기대하는 응답)**

GET /api/quiz/concept-data?conceptId={number}

Authorization: Bearer {accessToken}

**200 Response**

{

"randomSeed": 4815162342,

"conceptId": 10,

"conceptTitle": "public",

"parentId": 6,

"detailsList": [

{ "id": 11, "conceptId": 10, "key": "definition", "value": "..." }

],

"siblings": [

{

"conceptId": 11,

"conceptTitle": "protected",

"detailsList": [{ "id": 12, "conceptId": 11, "key": "definition", "value": "..." }]

}

]

}

| **필드**       | **타입**         | **프론트 사용처**                   |
| -------------- | ---------------- | ----------------------------------- | ------------------------------------ |
| `randomSeed`   | number           | `quizGenerator` RNG 시드            |
| `conceptId`    | number           | 문제 `categoryId` 등                |
| `conceptTitle` | string           | 단답형 정답, 문항 텍스트            |
| `parentId`     | number           | null                                | 형제 조회용 (서버에서 siblings 채움) |
| `detailsList`  | ConceptDetail[]  | 객관식/OX/단답형 소스               |
| `siblings`     | SiblingConcept[] | 객관식 오답, 매칭형 (3개 이상 필요) |

**에러**

| **status** | **code**             | **처리 제안**              |
| ---------- | -------------------- | -------------------------- |
| 401        | `AUTH_INVALID_TOKEN` | 재로그인                   |
| 404        | `CONCEPT_NOT_FOUND`  | 스테이지/데이터 없음 안내  |
| 400        | `MISSING_PARAMETER`  | 개발 버그 (conceptId 누락) |

---

## **데이터 흐름 (PR 리뷰용)**

[QuizScreen]

stageId → STAGE_CONCEPT_MAP[stageId] → conceptId

↓

fetchQuizConceptData(conceptId) // api/quiz.ts

↓

GET /api/quiz/concept-data

↓

generateQuestionsFromConceptData(data) // utils/quizGenerator.ts (변경 없음)

↓

useQuizStore.setQuestions(...)

---

## **Test plan (PR 체크리스트)**

### **백엔드 단독**

_# 1) 로그인 후 accessToken 확보_

_# 2) concept-data 호출_

curl -H "Authorization: Bearer <ACCESS_TOKEN>" \

"http://localhost:8080/api/quiz/concept-data?conceptId=10"

- [ ] 200 + `randomSeed`, `detailsList`, `siblings` 존재
- [ ] `conceptId=99999` → 404 `CONCEPT_NOT_FOUND`
- [ ] 토큰 없음 → 401

### **프론트 통합**

- [ ] `.env`의 `EXPO_PUBLIC_API_URL`이 백엔드와 일치
- [ ] 로그인 상태에서 스테이지 `1` 진입 → API 호출 후 문제 표시
- [ ] 스테이지 `2` 진입 → 동일
- [ ] `STAGE_CONCEPT_MAP`에 없는 스테이지 → 기존 `MOCK_QUESTIONS` fallback (의도된 동작이면 OK)
- [ ] 네트워크/서버 다운 시 UX (mock fallback vs 에러 메시지) 팀 합의대로 동작

### **회귀**

- [ ] 문제 유형 4종(객관식/OX/단답/매칭) 중 `siblings.length >= 3`인 concept에서 객관식·매칭 생성
- [ ] `randomSeed` 바뀔 때마다 보기 순서만 바뀌고 정답 로직은 유지

---

## **Known limitations (PR 본문에 적어두면 좋음)**

1. **스테이지 매핑 2개만 API 연동** — 나머지는 아직 mock 문제
2. **submit-result 미연동** — 이번 PR은 “데이터 받기”만; 결과 제출은 별도 PR
3. **A안(pool API) 미구현** — conceptId 지정 방식(B안)만 사용

---

## **PR 본문 템플릿 (복붙용)**

**## Summary**

- 퀴즈 concept 데이터를 mock에서 실제 API(`GET /api/quiz/concept-data`)로 전환
- 문제 생성 로직(`quizGenerator`)은 변경 없음

**## Changes**

- `api/quiz.ts`: axios 실제 호출로 교체
- `types/quiz.ts`: ConceptDetail.key를 string으로 완화 (선택)
- `mocks/quizConceptData.ts`: MOCK_CONCEPT_DATA 제거, STAGE_CONCEPT_MAP 유지

**## Depends on**

- Backend `qa`: Quiz API + chapter1_java 시드

**## Test plan**

- 스테이지 1, 2 진입 시 API 호출 및 문제 생성
- conceptId=10 cURL 200 확인
- 401/404 처리 확인

**## Screenshots / Notes**

- (스크린샷 또는 동작 영상 첨부)

---

## **작업 순서 (개발자용)**

1. 백엔드 `qa` 실행 + DB 시드 확인
2. `api/quiz.ts` 실제 API로 교체
3. (선택) `types/quiz.ts` key 타입 완화
4. mock import 정리
5. 스테이지 1·2 수동 테스트
6. PR 올리기 (위 템플릿 사용)
