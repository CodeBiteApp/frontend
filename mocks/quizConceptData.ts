import { QuizConceptData } from "@/types/quiz";

// GET /api/quiz/concept-data?conceptId={id} 응답 mock
// 값은 docs/[04] Quiz-Source.md concept_detail 기준

export const MOCK_CONCEPT_DATA: Record<number, QuizConceptData> = {
  // 스테이지 2: Java 프로그래밍이란 (concept_id=2)
  // 출처: Concept_detail id 1~6, 15
  // siblings: Java SE(8)·Java EE(9)·기본형(14) — section A에서 definition 보유 개념
  2: {
    randomSeed: 1234567890,
    conceptId: 2,
    conceptTitle: "Java 프로그래밍이란",
    parentId: 1,
    detailsList: [
      { id: 1, key: "definition",    value: "Java는 JVM 위에서 동작하는 객체지향 언어이며 한 번 작성하면 여러 환경에서 실행을 목표로 한다." },
      { id: 2, key: "specification", value: "Java 소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다." },
      { id: 3, key: "feature",       value: "Java의 플랫폼 독립성은 JVM이 제공하고 실행 성능은 JIT 컴파일러가 보완한다." },
    ],
    siblings: [
      {
        conceptId: 8,
        conceptTitle: "Java SE",
        detailsList: [
          { id: 5, key: "definition", value: "Java SE는 언어와 기본 라이브러리 중심의 표준 플랫폼이다." },
        ],
      },
      {
        conceptId: 9,
        conceptTitle: "Java EE",
        detailsList: [
          { id: 6, key: "definition", value: "Java EE는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다." },
        ],
      },
      {
        conceptId: 14,
        conceptTitle: "기본형",
        detailsList: [
          { id: 15, key: "definition", value: "기본형은 값 자체를 저장하는 데이터 타입이다." },
        ],
      },
    ],
  },

  // 스테이지 1: public (concept_id=10), 형제: protected·default·private (11·12·13)
  // 출처: Concept_detail id 11~14
  10: {
    randomSeed: 4815162342,
    conceptId: 10,
    conceptTitle: "public",
    parentId: 6,
    detailsList: [
      { id: 11, key: "definition", value: "public은 모든 곳에서 접근 가능한 접근 제어자이다." },
    ],
    siblings: [
      {
        conceptId: 11,
        conceptTitle: "protected",
        detailsList: [
          { id: 12, key: "definition", value: "protected는 같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다." },
        ],
      },
      {
        conceptId: 12,
        conceptTitle: "default",
        detailsList: [
          { id: 13, key: "definition", value: "default는 같은 패키지에서만 접근 가능한 접근 제어자이다." },
        ],
      },
      {
        conceptId: 13,
        conceptTitle: "private",
        detailsList: [
          { id: 14, key: "definition", value: "private는 같은 클래스 내부에서만 접근 가능한 접근 제어자이다." },
        ],
      },
    ],
  },
};

// 스테이지 ID → conceptId 매핑 (API flow를 사용하는 스테이지만 등록)
export const STAGE_CONCEPT_MAP: Record<string, number> = {
  "1": 10,
  "2": 2,
};
