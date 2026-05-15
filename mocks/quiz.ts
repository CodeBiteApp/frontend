import { AnyQuizQuestion } from "@/types/quiz";

// 임시 문제 데이터 (추후 API/DB로 교체)
// stage 3–8: java-quiz.json 원천 데이터 기반 (Subject=java, Concept 15개, ConceptDetail 21개)
export const MOCK_QUESTIONS: Record<string, AnyQuizQuestion[]> = {
  // ── stage 4: Java SE·EE & 언어 특성 ─────────────────────────────────────
  "4": [
    // 객관식 — concept_id=3 comparison (row=4)
    {
      id: "q4-1",
      categoryId: "4",
      question: "Java SE와 Java EE의 차이에 대한 설명으로 옳은 것은?",
      options: [
        "Java SE는 '기본' 표준 플랫폼이고, Java EE(현재 Jakarta EE)는 '대규모 서버 애플리케이션용 확장' 플랫폼이다.",
        "Java는 JVM 위에서 동작하는 객체지향 언어이며 '한 번 작성하면 여러 환경에서 실행'을 목표로 한다.",
        "기본형(primitive)은 값 자체를 보관하는 Java의 기본 데이터 타입이다.",
        "캡슐화 관점에서 접근 제어자는 가능한 한 좁은 범위로 열어두는 것이 권장된다.",
      ],
      answerIndex: 0,
      explanation:
        "Java SE(Standard Edition)는 언어 기본 라이브러리를 정의하고, Java EE(현재 Jakarta EE)는 서블릿·JPA·트랜잭션 등 엔터프라이즈 기능을 추가합니다.",
    },
    // OX — concept_id=5 feature (row=9) → O
    {
      id: "q4-2",
      categoryId: "4",
      type: "ox",
      question:
        "Java의 장점은 플랫폼 독립성, 풍부한 생태계, 자동 메모리 관리, 멀티스레딩 지원, 유지보수성이다.",
      answer: true,
      explanation:
        "Java 언어의 장단점(concept_id=5) 중 장점(feature, row=9)에 해당하는 정확한 설명입니다.",
    },
    // 단답형 — concept_id=8 definition (row=5)
    {
      id: "q4-3",
      categoryId: "4",
      type: "short-answer",
      question:
        '"언어와 기본 라이브러리 중심의 표준 플랫폼으로 컬렉션, IO, 스레드 등을 포함한다."\n\n무엇에 관한 설명인가?',
      answer: "Java SE",
      explanation:
        "Java SE(concept_id=8)의 definition(row=5)입니다. Java SE는 언어 코어와 기본 API를 포함한 표준 에디션입니다.",
    },
    // 매칭형 — concept_id=8,9,5 definition/best_practice (row=5,6,11)
    {
      id: "q4-4",
      categoryId: "4",
      type: "matching",
      question: "각 개념에 해당하는 설명을 올바르게 연결하세요.",
      leftItems: ["Java SE", "Java EE", "Java 언어의 장단점"],
      rightItems: [
        "실무에서는 JIT와 GC의 지속적 개선으로 과거 대비 성능 격차가 많이 줄었다.",
        "언어와 기본 라이브러리 중심의 표준 플랫폼으로 컬렉션, IO, 스레드 등을 포함한다.",
        "웹과 엔터프라이즈 기능(API, 트랜잭션, DI 등)을 포함한 확장 플랫폼이다.",
      ],
      correctPairs: { 0: 1, 1: 2, 2: 0 },
      explanation:
        "Java SE(row=5)는 기본 라이브러리 플랫폼, Java EE(row=6)는 엔터프라이즈 확장 플랫폼, Java 언어의 장단점(row=11)은 JIT·GC 개선으로 성능 격차 감소를 설명합니다.",
    },
    // 객관식 — concept_id=5 best_practice (row=11)
    {
      id: "q4-5",
      categoryId: "4",
      question: "Java 언어의 실무 관점에서 옳은 설명은?",
      options: [
        "실무에서는 JIT와 GC의 지속적 개선으로 과거 대비 성능 격차가 많이 줄었다.",
        "기본형 변수는 값 자체를 보관하고, 참조형 변수는 객체의 참조값(주소 개념)을 보관한다.",
        "Java 소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다.",
        "protected는 같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다.",
      ],
      answerIndex: 0,
      explanation:
        "JIT(Just-In-Time) 컴파일러와 GC의 발전으로 Java의 성능은 초창기 대비 크게 향상되어 C/C++과의 격차가 줄었습니다(best_practice, row=11).",
    },
  ],
  "1": [
    {
      id: "q1-1",
      categoryId: "1",
      question: "변수(Variable)를 가장 잘 설명한 것은?",
      options: [
        "프로그램을 실행하는 명령",
        "데이터를 저장하는 이름 있는 공간",
        "함수를 호출하는 키워드",
        "코드의 실행 순서를 바꾸는 구문",
      ],
      answerIndex: 1,
      explanation:
        "변수는 데이터를 저장하기 위한 메모리 공간에 이름을 붙인 것입니다.",
    },
    {
      id: "q1-2",
      categoryId: "1",
      question: "다음 중 JavaScript에서 올바른 주석(Comment) 작성 방법은?",
      options: [
        "<!-- 이것은 주석 -->",
        "** 이것은 주석 **",
        "// 이것은 주석",
        "## 이것은 주석",
      ],
      answerIndex: 2,
      explanation: "JavaScript에서 한 줄 주석은 '//'로 시작합니다.",
    },
    {
      id: "q1-3",
      categoryId: "1",
      question: "함수(Function)를 사용하는 주된 이유는?",
      options: [
        "코드 실행 속도를 높이기 위해",
        "파일 크기를 줄이기 위해",
        "반복되는 코드를 재사용하기 위해",
        "변수를 선언하기 위해",
      ],
      answerIndex: 2,
      explanation: "함수는 반복되는 코드를 묶어 재사용할 수 있게 해줍니다.",
    },
    {
      id: "q1-4",
      categoryId: "1",
      question: "JavaScript에서 'falsy(거짓 같은 값)'에 해당하지 않는 것은?",
      options: ["0", '""(빈 문자열)', "null", '"false"(문자열)'],
      answerIndex: 3,
      explanation: '"false"는 비어있지 않은 문자열이므로 truthy 값입니다.',
    },
    {
      id: "q1-5",
      categoryId: "1",
      question: "반복문(Loop)의 주된 목적은?",
      options: [
        "조건에 따라 다른 코드를 실행하기",
        "동일한 코드를 여러 번 반복 실행하기",
        "함수를 정의하기",
        "변수의 타입을 변환하기",
      ],
      answerIndex: 1,
      explanation:
        "반복문(for, while 등)은 특정 코드 블록을 여러 번 실행할 때 사용합니다.",
    },
  ],
  "2": [
    // 객관식
    {
      id: "q2-1",
      categoryId: "2",
      question: "배열(Array)의 첫 번째 요소에 접근하는 인덱스는?",
      options: ["1", "0", "-1", "first"],
      answerIndex: 1,
      explanation: "대부분의 언어에서 배열의 인덱스는 0부터 시작합니다.",
    },
    // 단답형
    {
      id: "q2-2",
      categoryId: "2",
      type: "short-answer",
      question:
        "JavaScript에서 console.log(typeof null)을 실행하면\n어떤 값이 출력될까요?",
      answer: "object",
      explanation:
        "JavaScript의 오래된 버그로, typeof null은 'object'를 반환합니다.",
    },
    // OX
    {
      id: "q2-3",
      categoryId: "2",
      type: "ox",
      question: "JavaScript에서 '=='는 값과 타입을 모두 비교한다.",
      answer: false,
      explanation:
        "'=='는 타입을 자동 변환한 뒤 값만 비교합니다. 값과 타입 모두 비교하려면 '==='를 사용해야 합니다.",
    },
    // 매칭형
    {
      id: "q2-4",
      categoryId: "2",
      type: "matching",
      question: "자료구조와 그 특징을 올바르게 연결하세요.",
      leftItems: ["스택 (Stack)", "큐 (Queue)", "해시맵 (HashMap)"],
      rightItems: ["FIFO 방식", "키-값 쌍 저장", "LIFO 방식"],
      correctPairs: { 0: 2, 1: 0, 2: 1 },
      explanation:
        "스택은 LIFO(Last In First Out), 큐는 FIFO(First In First Out), 해시맵은 키-값 쌍으로 데이터를 저장합니다.",
    },
  ],
  // ── stage 5: Java 기초 개관 ─────────────────────────────────────────────
  "5": [
    // 객관식 — concept_id=2 (Java 프로그래밍이란) definition (row=1)
    {
      id: "q5-1",
      categoryId: "5",
      question: "Java 프로그래밍에 대한 설명으로 옳은 것은?",
      options: [
        "Java는 JVM 위에서 동작하는 객체지향 언어이며 '한 번 작성하면 여러 환경에서 실행'을 목표로 한다.",
        "Java SE는 웹과 엔터프라이즈 기능(API, 트랜잭션, DI 등)을 포함한 확장 플랫폼이다.",
        "기본형 변수는 객체의 참조값(주소 개념)을 보관한다.",
        "private는 같은 패키지에서만 접근 가능한 접근 제어자이다.",
      ],
      answerIndex: 0,
      explanation:
        "Java는 JVM(Java Virtual Machine) 위에서 실행되는 객체지향 언어로, WORA(Write Once, Run Anywhere) 철학을 가집니다.",
    },
    // OX — concept_id=2 specification (row=2) → O
    {
      id: "q5-2",
      categoryId: "5",
      type: "ox",
      question:
        "Java 소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다.",
      answer: true,
      explanation:
        "javac 컴파일러가 .java 파일을 .class(바이트코드)로 변환하고, JVM이 해당 바이트코드를 각 플랫폼에 맞게 실행합니다.",
    },
    // 단답형 — concept_id=4 comparison (row=8)
    {
      id: "q5-3",
      categoryId: "5",
      type: "short-answer",
      question:
        '"Java는 이식성과 생산성이 강점이고, C/C++은 저수준 제어와 성능 최적화에 강점이 있다."\n\n무엇에 관한 설명인가?',
      answer: "Java와 C/C++ 차이",
      explanation:
        "Java vs C/C++ 비교(comparison)에 해당하는 설명으로, 각 언어의 핵심 강점 차이를 나타냅니다.",
    },
    // 매칭형 — concept_id=10,11,12 definition (row=13,14,15)
    {
      id: "q5-4",
      categoryId: "5",
      type: "matching",
      question: "접근 제어자와 그 설명을 올바르게 연결하세요.",
      leftItems: ["public", "protected", "default"],
      rightItems: [
        "같은 패키지에서만 접근 가능한 접근 제어자이다.",
        "모든 곳에서 접근 가능한 접근 제어자이다.",
        "같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다.",
      ],
      correctPairs: { 0: 1, 1: 2, 2: 0 },
      explanation:
        "public > protected > default > private 순으로 접근 범위가 좁아집니다.",
    },
    // 객관식 — concept_id=6 best_practice (row=12)
    {
      id: "q5-5",
      categoryId: "5",
      question: "접근 제어자의 올바른 사용 관행으로 옳은 것은?",
      options: [
        "캡슐화 관점에서 접근 제어자는 가능한 한 좁은 범위로 열어두는 것이 권장된다.",
        "Java의 단점은 JVM 계층으로 인한 오버헤드 가능성, 런타임 튜닝 필요, 예외 처리 코드가 길어질 수 있다는 점이다.",
        "Java SE는 언어와 기본 라이브러리 중심의 표준 플랫폼으로 컬렉션, IO, 스레드 등을 포함한다.",
        "Java EE(현재 Jakarta EE)는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다.",
      ],
      answerIndex: 0,
      explanation:
        "캡슐화 원칙에 따라 필드와 메서드는 private → default → protected → public 순으로 필요한 최소 범위만 열어두어야 합니다.",
    },
  ],

  // ── stage 6: Java 데이터 타입 ────────────────────────────────────────────
  "6": [
    // 객관식 — concept_id=14 specification (row=19)
    {
      id: "q6-1",
      categoryId: "6",
      question: "Java 데이터 타입에 대한 설명으로 옳은 것은?",
      options: [
        "Java 기본형에는 byte, short, int, long, float, double, char, boolean 8가지가 있다.",
        "Java의 플랫폼 독립성은 JVM이 제공하고 실행 성능은 JIT 컴파일러가 보완한다.",
        "Java EE(현재 Jakarta EE)는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다.",
        "캡슐화 관점에서 접근 제어자는 가능한 한 좁은 범위로 열어두는 것이 권장된다.",
      ],
      answerIndex: 0,
      explanation:
        "Java의 8가지 기본형: 정수형(byte·short·int·long), 실수형(float·double), 문자형(char), 논리형(boolean).",
    },
    // OX — concept_id=7 comparison (row=17) → O
    {
      id: "q6-2",
      categoryId: "6",
      type: "ox",
      question:
        "기본형 변수는 값 자체를 보관하고, 참조형 변수는 객체의 참조값(주소 개념)을 보관한다.",
      answer: true,
      explanation:
        "기본형은 스택에 값을 직접 저장하고, 참조형은 힙의 객체를 가리키는 참조값(레퍼런스)을 스택에 저장합니다.",
    },
    // 단답형 — concept_id=15 definition (row=20)
    {
      id: "q6-3",
      categoryId: "6",
      type: "short-answer",
      question:
        '"참조형(reference)은 객체의 참조값(주소 개념)을 보관하는 Java의 데이터 타입이다."\n\n무엇에 관한 설명인가?',
      answer: "참조형",
      explanation:
        "참조형(reference type)은 객체가 저장된 힙 메모리의 주소를 담는 타입으로, 배열·클래스·인터페이스·열거형·String 등이 포함됩니다.",
    },
    // OX — concept_id=15 specification (row=21) → X (기본형이 아닌 참조형의 spec)
    {
      id: "q6-4",
      categoryId: "6",
      type: "ox",
      question:
        '"Java 참조형에는 배열, 클래스, 인터페이스, 열거형, String 등이 있다."는 기본형(primitive)의 specification이다.',
      answer: false,
      explanation:
        "이 진술은 참조형(reference type)의 specification(row=21)입니다. 기본형의 specification은 byte·short·int·long·float·double·char·boolean 8가지입니다.",
    },
    // 객관식 — concept_id=14 definition (row=18)
    {
      id: "q6-5",
      categoryId: "6",
      question: "기본형(primitive)에 대한 설명으로 옳은 것은?",
      options: [
        "기본형(primitive)은 값 자체를 보관하는 Java의 기본 데이터 타입이다.",
        "참조형(reference)은 값 자체를 보관하는 Java의 데이터 타입이다.",
        "Java 참조형에는 byte, short, int, long, float, double, char, boolean 8가지가 있다.",
        "기본형 변수는 객체의 참조값(주소 개념)을 보관한다.",
      ],
      answerIndex: 0,
      explanation:
        "기본형은 값을 직접 보관하는 타입이며, 참조형과 달리 null을 가질 수 없고 스택에 직접 저장됩니다.",
    },
  ],

  // ── stage 7: Java SE·EE & 언어 특성 ─────────────────────────────────────
  "7": [
    // 객관식 — concept_id=3 comparison (row=4)
    {
      id: "q7-1",
      categoryId: "7",
      question: "Java SE와 Java EE의 차이에 대한 설명으로 옳은 것은?",
      options: [
        "Java SE는 '기본' 표준 플랫폼이고, Java EE(현재 Jakarta EE)는 '대규모 서버 애플리케이션용 확장' 플랫폼이다.",
        "Java SE는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다.",
        "Java EE는 컬렉션, IO, 스레드 등을 포함한 기본 라이브러리 표준 플랫폼이다.",
        "Java 기본형에는 byte, short, int, long, float, double, char, boolean 8가지가 있다.",
      ],
      answerIndex: 0,
      explanation:
        "Java SE(Standard Edition)는 언어 기본 라이브러리를 정의하고, Java EE(Enterprise Edition, 현 Jakarta EE)는 서블릿·JPA·트랜잭션 등 엔터프라이즈 기능을 추가합니다.",
    },
    // OX — concept_id=5 feature (row=9) → O
    {
      id: "q7-2",
      categoryId: "7",
      type: "ox",
      question:
        "Java의 장점은 플랫폼 독립성, 풍부한 생태계, 자동 메모리 관리, 멀티스레딩 지원, 유지보수성이다.",
      answer: true,
      explanation:
        "이는 Java 언어의 장단점(concept_id=5) 중 장점(feature, row=9)에 해당하는 정확한 설명입니다.",
    },
    // 단답형 — concept_id=9 definition (row=6)
    {
      id: "q7-3",
      categoryId: "7",
      type: "short-answer",
      question:
        '"Java EE(현재 Jakarta EE)는 웹과 엔터프라이즈 기능(API, 트랜잭션, DI 등)을 포함한 확장 플랫폼이다."\n\n무엇에 관한 설명인가?',
      answer: "Java EE",
      explanation:
        "Jakarta EE로 이름이 변경된 Java EE는 대규모 서버 애플리케이션 개발을 위한 엔터프라이즈 기능을 제공합니다.",
    },
    // 매칭형 — key(definition/comparison/best_practice) × value (row=16,8,11)
    {
      id: "q7-4",
      categoryId: "7",
      type: "matching",
      question: "Key 유형과 해당하는 Value를 올바르게 연결하세요.",
      leftItems: ["definition", "comparison", "best_practice"],
      rightItems: [
        "private는 같은 클래스 내부에서만 접근 가능한 접근 제어자이다.",
        "Java는 이식성과 생산성이 강점이고, C/C++은 저수준 제어와 성능 최적화에 강점이 있다.",
        "실무에서는 JIT와 GC의 지속적 개선으로 과거 대비 성능 격차가 많이 줄었다.",
      ],
      correctPairs: { 0: 0, 1: 1, 2: 2 },
      explanation:
        "definition은 개념 정의, comparison은 두 대상의 비교, best_practice는 실무 권장 사항을 나타내는 key 유형입니다.",
    },
    // 객관식 — concept_id=5 best_practice (row=11)
    {
      id: "q7-5",
      categoryId: "7",
      question: "Java 언어의 실무 관점에서 옳은 설명은?",
      options: [
        "실무에서는 JIT와 GC의 지속적 개선으로 과거 대비 성능 격차가 많이 줄었다.",
        "Java는 컴파일·링크 후 네이티브 바이너리를 실행하고 메모리 관리 책임이 개발자에게 더 크다.",
        "public은 같은 클래스 내부에서만 접근 가능한 접근 제어자이다.",
        "Java SE는 웹과 엔터프라이즈 기능을 포함한 확장 플랫폼이다.",
      ],
      answerIndex: 0,
      explanation:
        "JIT(Just-In-Time) 컴파일러와 GC(Garbage Collector)의 발전으로 Java의 성능은 초창기 대비 크게 향상되어 C/C++과의 격차가 줄었습니다.",
    },
  ],

  // ── stage 8: Java 기초 복습 (유형별 1문제) ──────────────────────────────
  "8": [
    // 객관식 — concept_id=5 feature (row=9)
    {
      id: "q8-1",
      categoryId: "8",
      question: "Java 언어의 장단점에 대한 설명으로 옳은 것은?",
      options: [
        "Java SE는 언어와 기본 라이브러리 중심의 표준 플랫폼으로 컬렉션, IO, 스레드 등을 포함한다.",
        "기본형 변수는 값 자체를 보관하고, 참조형 변수는 객체의 참조값(주소 개념)을 보관한다.",
        "Java의 장점은 플랫폼 독립성, 풍부한 생태계, 자동 메모리 관리, 멀티스레딩 지원, 유지보수성이다.",
        "Java 소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다.",
      ],
      answerIndex: 2,
      explanation:
        "Java 언어의 장점(feature, row=9)에 해당하는 설명입니다. 나머지 선택지는 Java SE 정의, 데이터 타입 비교, Java 프로그래밍 명세에 해당합니다.",
    },
    // OX — concept_id=13 (private) definition (row=16) → X: default가 아닌 private의 definition
    {
      id: "q8-2",
      categoryId: "8",
      type: "ox",
      question:
        '"private는 같은 클래스 내부에서만 접근 가능한 접근 제어자이다."는 default의 definition이다.',
      answer: false,
      explanation:
        "이 설명은 private의 definition(row=16)입니다. default(package-private)는 같은 패키지에서만 접근 가능한 접근 제어자입니다.",
    },
    // 단답형 — concept_id=7 comparison (row=17)
    {
      id: "q8-3",
      categoryId: "8",
      type: "short-answer",
      question:
        '"기본형 변수는 값 자체를 보관하고, 참조형 변수는 객체의 참조값(주소 개념)을 보관한다."\n\n무엇에 관한 설명인가?',
      answer: "Java 데이터 타입",
      explanation:
        "기본형과 참조형의 차이를 설명하는 comparison(row=17)으로, 부모 concept인 Java 데이터 타입(concept_id=7)에 속합니다.",
    },
    // 매칭형 — concept_id=10,11,13 definition (row=13,14,16)
    {
      id: "q8-4",
      categoryId: "8",
      type: "matching",
      question: "접근 제어자와 그 설명을 올바르게 연결하세요.",
      leftItems: ["public", "protected", "private"],
      rightItems: [
        "같은 클래스 내부에서만 접근 가능한 접근 제어자이다.",
        "모든 곳에서 접근 가능한 접근 제어자이다.",
        "같은 패키지와 상속관계에서 접근 가능한 접근 제어자이다.",
      ],
      correctPairs: { 0: 1, 1: 2, 2: 0 },
      explanation:
        "public(row=13)은 모든 곳, protected(row=14)는 같은 패키지+상속, private(row=16)은 같은 클래스 내부에서만 접근 가능합니다.",
    },
  ],

  // ── stage 3: Java 프로그래밍 기초 ───────────────────────────────────────
  "3": [
    // 객관식 — concept_id=2 definition (row=1)
    {
      id: "q3-1",
      categoryId: "3",
      question: "Java 프로그래밍이란 무엇인지 옳게 설명한 것은?",
      options: [
        "Java는 JVM 위에서 동작하는 객체지향 언어이며 '한 번 작성하면 여러 환경에서 실행'을 목표로 한다.",
        "Java SE는 언어와 기본 라이브러리 중심의 표준 플랫폼으로 컬렉션, IO, 스레드 등을 포함한다.",
        "private는 같은 클래스 내부에서만 접근 가능한 접근 제어자이다.",
        "Java 기본형에는 byte, short, int, long, float, double, char, boolean 8가지가 있다.",
      ],
      answerIndex: 0,
      explanation:
        "Java는 JVM(Java Virtual Machine) 위에서 실행되는 객체지향 언어로, WORA(Write Once, Run Anywhere) 철학을 가집니다(definition, row=1).",
    },
    // OX — concept_id=2 feature (row=3) → O
    {
      id: "q3-2",
      categoryId: "3",
      type: "ox",
      question:
        "Java의 플랫폼 독립성은 JVM이 제공하고 실행 성능은 JIT 컴파일러가 보완한다.",
      answer: true,
      explanation:
        "JVM이 바이트코드를 각 OS에 맞게 실행하여 플랫폼 독립성을 보장하고, JIT 컴파일러는 런타임에 바이트코드를 네이티브 코드로 변환해 성능을 보완합니다(feature, row=3).",
    },
    // 단답형 — concept_id=4 comparison (row=7)
    {
      id: "q3-3",
      categoryId: "3",
      type: "short-answer",
      question:
        '"Java는 컴파일 후 바이트코드를 실행(JVM 필요)하며 자동 메모리 관리(GC)를 사용하지만, C/C++는 컴파일·링크 후 네이티브 바이너리를 실행하고 메모리 관리 책임이 개발자에게 더 크다."\n\n무엇에 관한 설명인가?',
      answer: "Java와 C/C++ 차이",
      explanation:
        "Java와 C/C++의 실행 방식(바이트코드 vs 네이티브 바이너리)과 메모리 관리 방식(GC vs 수동)의 차이를 설명하는 comparison(row=7)입니다.",
    },
    // 매칭형 — concept_id=2,4,5 각 대표 value (row=2,8,10)
    {
      id: "q3-4",
      categoryId: "3",
      type: "matching",
      question: "각 개념에 해당하는 설명을 올바르게 연결하세요.",
      leftItems: ["Java 프로그래밍이란", "Java와 C/C++ 차이", "Java 언어의 장단점"],
      rightItems: [
        "이식성과 생산성이 강점이고, C/C++은 저수준 제어와 성능 최적화에 강점이 있다.",
        "단점은 JVM 계층으로 인한 오버헤드 가능성, 런타임 튜닝 필요, 예외 처리 코드가 길어질 수 있다는 점이다.",
        "소스 코드를 컴파일하면 바이트코드(.class)가 생성되고 JVM이 이를 실행한다.",
      ],
      correctPairs: { 0: 2, 1: 0, 2: 1 },
      explanation:
        "Java 프로그래밍이란(row=2)은 바이트코드 명세, Java와 C/C++ 차이(row=8)는 이식성 비교, Java 언어의 장단점(row=10)은 단점 설명에 해당합니다.",
    },
    // 객관식 — concept_id=5 feature (row=10)
    {
      id: "q3-5",
      categoryId: "3",
      question: "Java 언어의 단점에 대한 설명으로 옳은 것은?",
      options: [
        "Java의 단점은 JVM 계층으로 인한 오버헤드 가능성, 런타임 튜닝 필요, 예외 처리 코드가 길어질 수 있다는 점이다.",
        "public은 모든 곳에서 접근 가능한 접근 제어자이다.",
        "Java EE(현재 Jakarta EE)는 웹과 엔터프라이즈 기능(API, 트랜잭션, DI 등)을 포함한 확장 플랫폼이다.",
        "기본형 변수는 값 자체를 보관하고, 참조형 변수는 객체의 참조값(주소 개념)을 보관한다.",
      ],
      answerIndex: 0,
      explanation:
        "Java의 단점(feature, row=10): JVM 계층 오버헤드, GC 튜닝 부담, 장황한 예외 처리 코드. 나머지 선택지는 접근 제어자·Java EE·데이터 타입에 대한 설명입니다.",
    },
  ],
};
