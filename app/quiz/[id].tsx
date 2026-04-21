import { Button } from "@/components/common/Button";
import { QuizCard } from "@/components/quiz/QuizCard";
import { QuizOption } from "@/components/quiz/QuizOption";
import { QuizResultCharacter } from "@/components/quiz/QuizResultCharacter";
import { useQuizStore } from "@/store/useQuizStore";
import { useStageStore } from "@/store/useStageStore";
import type { QuizQuestion } from "@/types/quiz";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

// 임시 문제 데이터 (추후 API/DB로 교체)
const MOCK_QUESTIONS: Record<string, QuizQuestion[]> = {
  "1": [
    {
      id: "q1",
      categoryId: "1",
      question: "대한민국의 수도는?",
      options: ["부산", "서울", "인천", "대구"],
      answerIndex: 1,
    },
    {
      id: "q2",
      categoryId: "1",
      question: "1년은 몇 개월인가?",
      options: ["10", "11", "12", "13"],
      answerIndex: 2,
    },
    {
      id: "q3",
      categoryId: "1",
      question: "태양계에서 가장 큰 행성은?",
      options: ["토성", "목성", "천왕성", "해왕성"],
      answerIndex: 1,
    },
  ],
  "2": [
    {
      id: "q4",
      categoryId: "2",
      question: "물의 화학식은?",
      options: ["CO2", "H2O", "O2", "NaCl"],
      answerIndex: 1,
    },
    {
      id: "q5",
      categoryId: "2",
      question: "빛의 속도는 약 몇 km/s인가?",
      options: ["10만", "20만", "30만", "40만"],
      answerIndex: 2,
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
    const points = correct * 10;
    return (
      <View style={styles.resultContainer}>
        <QuizResultCharacter />
        <Text style={styles.resultTitle}>퀴즈 완료!</Text>
        <Text style={styles.resultScore}>
          {correct} / {questions.length} 정답
        </Text>
        <Text style={styles.resultPoints}>+{points}P 획득</Text>
        <Button
          title="다음"
          onPress={() => {
            router.back();
          }}
          style={styles.btn}
        />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <QuizCard
        questionNumber={currentIndex + 1}
        total={questions.length}
        question={current.question}
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
              onPress={() => {
                if (!isAnswered) {
                  selectAnswer(i);
                }
              }}
            />
          );
        })}
      </View>
      {isAnswered && (
        <Button
          title={
            currentIndex === questions.length - 1 ? "결과 보기" : "다음 문제"
          }
          onPress={handleNext}
          style={styles.btn}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  content: { padding: 20, paddingTop: 60, gap: 16 },
  options: { gap: 12 },
  btn: { marginTop: 8 },
  resultContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    gap: 12,
  },
  resultTitle: { fontSize: 28, fontWeight: "bold", color: "#1a1a1a" },
  resultScore: { fontSize: 20, color: "#333" },
  resultPoints: { fontSize: 18, fontWeight: "700", color: "#f5a623" },
});
