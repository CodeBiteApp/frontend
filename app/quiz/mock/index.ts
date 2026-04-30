import { QuizQuestion } from "@/types/quiz";

// 임시 문제 데이터 (추후 API/DB로 교체)
export const MOCK_QUESTIONS: Record<string, QuizQuestion[]> = {
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
    {
      id: "q2-1",
      categoryId: "2",
      question: "배열(Array)의 첫 번째 요소에 접근하는 인덱스는?",
      options: ["1", "0", "-1", "first"],
      answerIndex: 1,
      explanation: "대부분의 언어에서 배열의 인덱스는 0부터 시작합니다.",
    },
    {
      id: "q2-2",
      categoryId: "2",
      question: "JavaScript에서 console.log(typeof null)의 출력 결과는?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      answerIndex: 2,
      explanation:
        "JavaScript의 오래된 버그로, typeof null은 'object'를 반환합니다.",
    },
    {
      id: "q2-3",
      categoryId: "2",
      question: "'==' 와 '===' 의 차이점은?",
      options: [
        "차이가 없다",
        "'=='는 값만 비교, '==='는 값과 타입 모두 비교",
        "'==='는 값만 비교, '=='는 값과 타입 모두 비교",
        "'=='는 숫자만 비교, '==='는 문자열만 비교",
      ],
      answerIndex: 1,
      explanation:
        "'=='는 타입 변환 후 값만 비교하고, '==='는 타입과 값을 모두 비교합니다.",
    },
    {
      id: "q2-4",
      categoryId: "2",
      question: "재귀(Recursion) 함수란?",
      options: [
        "반복문 없이 코드를 실행하는 함수",
        "자기 자신을 호출하는 함수",
        "외부 API를 호출하는 함수",
        "비동기로 실행되는 함수",
      ],
      answerIndex: 1,
      explanation:
        "재귀 함수는 함수 내부에서 자기 자신을 다시 호출하는 함수입니다.",
    },
    {
      id: "q2-5",
      categoryId: "2",
      question:
        "다음 코드의 출력 결과는?\nlet x = 5;\nx += 3;\nconsole.log(x);",
      options: ["3", "5", "8", "15"],
      answerIndex: 2,
      explanation: "x += 3은 x = x + 3과 같으므로 5 + 3 = 8입니다.",
    },
  ],
  "3": [
    {
      id: "q3-1",
      categoryId: "3",
      question: "클로저(Closure)란?",
      options: [
        "함수 실행이 끝난 후 메모리를 해제하는 기능",
        "외부 함수의 변수에 접근할 수 있는 내부 함수",
        "에러를 처리하는 try-catch 구문",
        "비동기 코드를 동기처럼 처리하는 문법",
      ],
      answerIndex: 1,
      explanation:
        "클로저는 자신이 선언될 당시의 외부 스코프 변수를 기억하는 내부 함수입니다.",
    },
    {
      id: "q3-2",
      categoryId: "3",
      question: "스택(Stack) 자료구조의 특성은?",
      options: [
        "먼저 넣은 데이터가 먼저 나온다 (FIFO)",
        "나중에 넣은 데이터가 먼저 나온다 (LIFO)",
        "데이터를 정렬된 순서로 저장한다",
        "키-값 쌍으로 데이터를 저장한다",
      ],
      answerIndex: 1,
      explanation:
        "스택은 LIFO(Last In, First Out) 구조로, 가장 나중에 추가된 데이터가 먼저 제거됩니다.",
    },
    {
      id: "q3-3",
      categoryId: "3",
      question: "동기(Synchronous)와 비동기(Asynchronous)의 차이는?",
      options: [
        "동기는 빠르고 비동기는 느리다",
        "동기는 작업이 끝날 때까지 기다리고, 비동기는 기다리지 않고 다음 코드를 실행한다",
        "동기는 서버에서, 비동기는 클라이언트에서 실행된다",
        "동기는 함수, 비동기는 클래스이다",
      ],
      answerIndex: 1,
      explanation:
        "동기는 순차 실행, 비동기는 작업 완료를 기다리지 않고 다음 코드를 실행합니다.",
    },
    {
      id: "q3-4",
      categoryId: "3",
      question: "객체지향 프로그래밍(OOP)의 4대 특성이 아닌 것은?",
      options: [
        "캡슐화(Encapsulation)",
        "상속(Inheritance)",
        "재귀(Recursion)",
        "다형성(Polymorphism)",
      ],
      answerIndex: 2,
      explanation:
        "OOP의 4대 특성은 캡슐화, 상속, 다형성, 추상화입니다. 재귀는 알고리즘 기법입니다.",
    },
    {
      id: "q3-5",
      categoryId: "3",
      question: "Big-O 표기법에서 O(1)이 의미하는 것은?",
      options: [
        "입력 크기에 따라 실행 시간이 제곱으로 늘어난다",
        "입력 크기에 따라 실행 시간이 선형으로 늘어난다",
        "입력 크기와 관계없이 실행 시간이 일정하다",
        "입력 크기에 따라 실행 시간이 로그로 늘어난다",
      ],
      answerIndex: 2,
      explanation:
        "O(1)은 상수 시간 복잡도로, 입력 크기에 상관없이 항상 동일한 시간이 걸립니다.",
    },
  ],
};
