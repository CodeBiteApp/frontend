## **1. 엔드포인트**

GET /api/quiz/concept-data?conceptId={id}

- **Method**: GET
- **Auth**: Access Token 필수 (`Authorization: Bearer <accessToken>`)
- **Query Param**:
  - `conceptId` (Long, required) — 시작할 concept의 ID

> _⚠️ `userId`는 보내지 않음. 서버가 JWT에서 추출._

---

## **2. 응답 (200 OK)**

{

"randomSeed": 4815162342,

"conceptId": 10,

"conceptTitle": "public",

"parentId": 6,

"detailsList": [

{ "id": 11, "conceptId": 10, "key": "definition", "value": "모든 곳에서 접근 가능한 접근 제어자이다." }

],

"siblings": [

{

"conceptId": 11,

"conceptTitle": "protected",

"detailsList": [

{ "id": 12, "conceptId": 11, "key": "definition", "value": "같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다." }

]

},

{

"conceptId": 12,

"conceptTitle": "default",

"detailsList": [

{ "id": 13, "conceptId": 12, "key": "definition", "value": "같은 패키지에서만 접근 가능한 접근 제어자이다." }

]

},

{

"conceptId": 13,

"conceptTitle": "private",

"detailsList": [

{ "id": 14, "conceptId": 13, "key": "definition", "value": "같은 클래스 내부에서만 접근 가능한 접근 제어자이다." }

]

}

]

}

### **필드 스펙**

| **필드**       | **타입**           | **설명**                                                     |
| -------------- | ------------------ | ------------------------------------------------------------ | ------------------------------ |
| `randomSeed`   | `number` (Long)    | 매 호출마다 새로 생성. 프론트 RNG 시드                       |
| `conceptId`    | `number` (Long)    | 요청한 concept ID                                            |
| `conceptTitle` | `string`           | concept 제목 (예: `"public"`)                                |
| `parentId`     | `number            | null`                                                        | 상위 concept ID. 루트면 `null` |
| `detailsList`  | `ConceptDetail[]`  | 해당 concept의 key/value 모음                                |
| `siblings`     | `SiblingConcept[]` | 같은 부모를 가진 다른 concept들. `parentId == null`이면 `[]` |

### **서브 타입**

_// ConceptDetail_

{

id: number;

conceptId: number;

key: string; _// "definition" | "feature" | "comparison" | "specification" 등 자유 문자열_

value: string;

}

_// SiblingConcept_

{

conceptId: number;

conceptTitle: string;

detailsList: ConceptDetail[];

}

> _💡 `key` 종류는 데이터에 따라 늘어날 수 있으니 **유니온 고정하지 말고 `string`으로 받는 걸 추천**._

---

## **3. 에러 응답**

공통 포맷:

{

"timestamp": "...",

"status": 404,

"code": "CONCEPT_NOT_FOUND",

"message": "해당 concept를 찾을 수 없습니다.",

"path": "/api/quiz/concept-data"

}

| **HTTP** | **code**             | **의미**              |
| -------- | -------------------- | --------------------- |
| 401      | `AUTH_INVALID_TOKEN` | 토큰 없음/만료        |
| 400      | `MISSING_PARAMETER`  | `conceptId` 누락      |
| 400      | `INVALID_ARGUMENT`   | `conceptId` 형식 오류 |
| 404      | `CONCEPT_NOT_FOUND`  | 존재하지 않는 concept |

---

## **4. 프론트 타입 호환 메모**

지금 `frontend/types/quiz.ts`의 `QuizConceptData`와 **거의 동일**합니다. 그대로 사용 가능하되 한 가지만:

- 기존: `ConceptDetailKey`가 유니온 6종 고정
- 권장: **`key: string`** 으로 완화 (백엔드 데이터 다양해지면 깨질 수 있음)

---

## **5. 호출 코드 (붙여 쓸 수 있는 버전)**

`frontend/api/quiz.ts`의 TODO를 이렇게 교체:

import api from "@/api/axios";

import { QuizConceptData } from "@/types/quiz";

export async function fetchQuizConceptData(conceptId: number): Promise<QuizConceptData> {

const res = await api.get<QuizConceptData>("/api/quiz/concept-data", {

params: { conceptId },

});

return res.data;

}

기존 `axiosInstance`/인증 인터셉터를 그대로 타기 때문에, 토큰은 따로 안 붙여도 됩니다.

---

## **6. 동작 흐름 (참고)**

1. 프론트: `fetchQuizConceptData(conceptId)` 호출
2. 백엔드: JWT 인증 → DB에서 concept + details + siblings 조회 → `randomSeed` 생성
3. 프론트: 받은 `randomSeed`로 RNG 초기화 → `detailsList` + `siblings`로 문제 조합
4. 결과 제출은 **기존 흐름(submit-result)** 그대로 — 이번 단계에서는 변경 없음

---

## **7. 빠른 점검 cURL**

curl -H "Authorization: Bearer <accessToken>" \

"http://localhost:8080/api/quiz/concept-data?conceptId=10"

`conceptId`로 추천 값:

- `10` (public, 형제 protected/default/private)
- `2` (Java 프로그래밍)
- `54` (ArrayList)
