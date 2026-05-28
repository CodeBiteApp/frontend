# [15] Quiz Generator - siblings 제거 수정

## 문제 요약

"Java SE" 스테이지를 시작했을 때 "Java와 C/C++ 차이", "Java EE" 등 **다른 개념의 문제가 섞여 출제**되는 현상.

---

## 원인

### API 응답 구조

`GET /api/quiz/concept-data?conceptId={id}` 는 다음 구조를 반환한다.

```ts
type QuizConceptData = {
  conceptId: number;
  conceptTitle: string;
  detailsList: ConceptDetail[];   // 해당 개념 설명
  siblings: SiblingConcept[];     // 같은 부모를 가진 형제 개념들
  ...
};
```

### 기존 toRawData() 동작

```ts
// 수정 전
data.detailsList.forEach(...)         // 메인 개념 추가
data.siblings.forEach((s) => {        // ⚠️ siblings 전부 flat하게 추가
  s.detailsList.forEach(...)
})
```

siblings를 메인 개념과 동일하게 flat하게 합쳐서 문제를 생성했기 때문에,
"Java SE" 스테이지에서 chapter A 전체 형제 개념(Java EE, C/C++ 차이, 접근제어자 등)의 문제가 함께 출제됐다.

---

## 수정 내용

**파일**: `utils/quizGenerator.ts` — `toRawData()` 함수

```ts
// 수정 후: detailsList만 사용, siblings 제거
function toRawData(data: QuizConceptData): RawItem[] {
  const all: RawItem[] = [];
  data.detailsList.forEach((d) => {
    all.push({
      concept_id: String(data.conceptId),
      title: data.conceptTitle,
      key: d.key,
      value: d.value,
    });
  });
  all.sort(...);
  return all;
}
```

siblings는 **오답 보기(distractor) 풀**로는 여전히 활용 가능하지만, 독립적인 문제 생성 대상에서는 제외한다.

---

## 영향 범위

| 항목 | 변경 전 | 변경 후 |
|---|---|---|
| 문제 출처 | 메인 개념 + 모든 siblings | 메인 개념만 |
| 문제 수 | siblings 포함 대량 생성 | 해당 개념 detailsList 기준 |
| OX X문제 distractor | siblings 포함 풀에서 선택 | 메인 개념 내 다른 detail에서 선택 |
| 매칭 문제 | siblings 포함 조합 | 메인 개념 내 조합 (3개 미만 시 미생성) |

> **주의**: 일부 개념(detailsList가 2개 이하)은 matching 문제가 생성되지 않을 수 있다.
> `generateMatching()`은 이미 `rawData.length < 3` 가드가 있으므로 별도 처리 불필요.

---

## 관련 파일

- `utils/quizGenerator.ts` — 수정 대상
- `types/quiz.ts` — `QuizConceptData.siblings` 타입 정의
- `api/quiz.ts` — `fetchQuizConceptData()`
- `app/quiz/[id].tsx` — 퀴즈 진입점
