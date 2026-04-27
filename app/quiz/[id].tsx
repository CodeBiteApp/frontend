import { Button } from "@/components/common/Button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizOption } from "@/components/quiz/QuizOption";
import { QuizResultCharacter } from "@/components/quiz/QuizResultCharacter";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import type { QuizQuestion } from "@/types/quiz";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const CHAPTER_COLORS = [
  "#58CC02", "#1CB0F6", "#00CD9C", "#FFC800", "#FF9600",
  "#FF4B4B", "#FF86D0", "#CE82FF", "#2B70C9", "#FF6B00",
];

function getAccentColor(stageId: string): string {
  const idx = Math.floor((Number(stageId ?? 1) - 1) / 7);
  return CHAPTER_COLORS[Math.min(idx, CHAPTER_COLORS.length - 1)];
}

// 임시 문제 데이터 (추후 API/DB로 교체)
const MOCK_QUESTIONS: Record<string, QuizQuestion[]> = {
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
      explanation: "변수는 데이터를 저장하기 위한 메모리 공간에 이름을 붙인 것입니다.",
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
      explanation: "반복문(for, while 등)은 특정 코드 블록을 여러 번 실행할 때 사용합니다.",
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
      explanation: "JavaScript의 오래된 버그로, typeof null은 'object'를 반환합니다.",
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
      explanation: "'=='는 타입 변환 후 값만 비교하고, '==='는 타입과 값을 모두 비교합니다.",
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
      explanation: "재귀 함수는 함수 내부에서 자기 자신을 다시 호출하는 함수입니다.",
    },
    {
      id: "q2-5",
      categoryId: "2",
      question: "다음 코드의 출력 결과는?\nlet x = 5;\nx += 3;\nconsole.log(x);",
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
      explanation: "클로저는 자신이 선언될 당시의 외부 스코프 변수를 기억하는 내부 함수입니다.",
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
      explanation: "스택은 LIFO(Last In, First Out) 구조로, 가장 나중에 추가된 데이터가 먼저 제거됩니다.",
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
      explanation: "동기는 순차 실행, 비동기는 작업 완료를 기다리지 않고 다음 코드를 실행합니다.",
    },
    {
      id: "q3-4",
      categoryId: "3",
      question: "객체지향 프로그래밍(OOP)의 4대 특성이 아닌 것은?",
      options: ["캡슐화(Encapsulation)", "상속(Inheritance)", "재귀(Recursion)", "다형성(Polymorphism)"],
      answerIndex: 2,
      explanation: "OOP의 4대 특성은 캡슐화, 상속, 다형성, 추상화입니다. 재귀는 알고리즘 기법입니다.",
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
      explanation: "O(1)은 상수 시간 복잡도로, 입력 크기에 상관없이 항상 동일한 시간이 걸립니다.",
    },
  ],
};

export default function QuizScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    questions,
    currentIndex,
    selectedAnswers,
    isFinished,
    setQuestions,
    selectAnswer,
    nextQuestion,
    finishQuiz,
    resetQuiz,
  } = useQuizStore();
  const { triggerEating } = useStageStore();

  const accentColor = getAccentColor(id ?? "1");

  useEffect(() => {
    const qs = MOCK_QUESTIONS[id ?? "1"] ?? [];
    setQuestions(qs);
    return () => resetQuiz();
  }, [id]);

  if (questions.length === 0) return null;

  if (isFinished) {
    const correct = questions.reduce(
      (acc, q, i) => acc + (selectedAnswers[i] === q.answerIndex ? 1 : 0),
      0,
    );
    const total = questions.length;
    const points = correct * 10;
    const isPerfect = correct === total;
    return (
      <View style={styles.resultContainer}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>✕</Text>
        </TouchableOpacity>
        <QuizResultCharacter />
        <Text style={styles.resultTitle}>
          {isPerfect ? "완벽해요!" : correct >= total / 2 ? "잘했어요!" : "다시 도전해봐요!"}
        </Text>
        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>정답</Text>
            <Text style={[styles.resultValue, { color: accentColor }]}>
              {correct} / {total}
            </Text>
          </View>
          <View style={styles.resultDivider} />
          <View style={styles.resultRow}>
            <Text style={styles.resultLabel}>획득 포인트</Text>
            <Text style={[styles.resultValue, { color: "#FFC800" }]}>+{points}P</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: accentColor }]}
          onPress={() => router.back()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>홈으로</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const current = questions[currentIndex];
  const selected = selectedAnswers[currentIndex];
  const isAnswered = selected !== null;

  const handleNext = () => {
    if (currentIndex === questions.length - 1) {
      finishQuiz(id ?? "1");
      triggerEating(id ?? "1");
    } else {
      nextQuestion();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backBtnText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>스테이지 {id}</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <QuizCard
          questionNumber={currentIndex + 1}
          total={questions.length}
          question={current.question}
          accentColor={accentColor}
        />
        <View style={styles.options}>
          {current.options.map((opt, i) => {
            const isCorrect =
              isAnswered && i === current.answerIndex
                ? true
                : isAnswered && i === selected && i !== current.answerIndex
                  ? false
                  : null;
            return (
              <QuizOption
                key={i}
                index={i}
                label={opt}
                selected={selected === i}
                correct={isCorrect}
                accentColor={accentColor}
                onPress={() => {
                  if (!isAnswered) selectAnswer(i);
                }}
              />
            );
          })}
        </View>
        {isAnswered && (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: accentColor }]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            <Text style={styles.nextBtnText}>
              {currentIndex === questions.length - 1 ? "결과 보기" : "다음 문제"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191A1C" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#242628",
    justifyContent: "center",
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontSize: 18, fontWeight: "600" },
  content: { padding: 20, paddingTop: 8, gap: 12 },
  options: { gap: 10 },
  nextBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  nextBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },

  // 결과 화면
  resultContainer: {
    flex: 1,
    backgroundColor: "#191A1C",
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 28,
    gap: 16,
  },
  resultTitle: { fontSize: 26, fontWeight: "800", color: "#fff" },
  resultCard: {
    width: "100%",
    backgroundColor: "#242628",
    borderRadius: 20,
    padding: 24,
    gap: 16,
    marginTop: 8,
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultDivider: { height: 1, backgroundColor: "#333537" },
  resultLabel: { color: "#888", fontSize: 15 },
  resultValue: { fontSize: 20, fontWeight: "800" },
  doneBtn: {
    width: "100%",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  doneBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});
