**백엔드 변경 내용**

- `ConceptDetailRepository`에 전역 조회 메서드 추가
  - `findByKeyAndConceptIdNotOrderByIdAsc(String key, Long conceptId)`
- `QuizConceptDataResponse`에 필드 추가
  - `globalDistractorCandidatesByKey: Map<String, List<String>>`
- `QuizDataService.getConceptData()`에서 후보 생성 로직 추가
  - 현재 concept의 detail key별로
  - 다른 concept에서 같은 key row 조회
  - 현재 concept value 제외
  - 중복 제거
  - 랜덤 셔플
  - key당 최대 30개만 반환

변경 파일:

- `backend/src/main/java/com/jajup/codeBite/quiz/repository/ConceptDetailRepository.java`
- `backend/src/main/java/com/jajup/codeBite/quiz/dto/QuizConceptDataResponse.java`
- `backend/src/main/java/com/jajup/codeBite/quiz/service/QuizDataService.java`

---

### **프론트에서 필요한 정보/적용 포인트**

`GET /api/quiz/concept-data` 응답에 아래 필드가 추가됩니다:

{

"globalDistractorCandidatesByKey": {

"definition": ["...", "..."],

"feature": ["...", "..."]

}

}

프론트 적용 방식(권장):

1. 기존처럼 먼저 같은 concept 내부 오답 수집
2. 3개 미만이면 `globalDistractorCandidatesByKey[item.key]`에서 보충
3. 그래도 부족하면 기존 `siblings` 보충 또는 객관식 제외 정책 적용

즉 `quizGenerator`에서 `item.key`를 기준으로 보충 풀을 읽으면 됩니다.
